import { PropMetadata, PropShape } from "../types/PropShape";
import TypeGuards from "../utils/TypeGuards";
import { STUDIO_PACKAGE_NAME } from "../constants";
import StudioSourceFileParser from "./StudioSourceFileParser";
import {
  ParsedInterface,
  ParsedInterfaceKind,
} from "./helpers/StaticParsingHelpers";
import { PropValueType } from "../types";

/**
 * PropShapeParser is a class for parsing a typescript interface into a PropShape.
 */
export default class PropShapeParser {
  private studioImports: string[];

  constructor(private studioSourceFileParser: StudioSourceFileParser) {
    this.studioImports =
      this.studioSourceFileParser.parseNamedImports()[STUDIO_PACKAGE_NAME] ??
      [];
  }

  /**
   * Get shape of the component's props, defined through an interface `${componentName}Props`.
   *
   * @param onProp - A function to execute when iterating through each field in the prop interface
   * @returns shape of the component's props
   */
  parsePropShape(
    interfaceName: string,
    onProp?: (propName: string) => boolean
  ): PropShape {
    const parsedInterface =
      this.studioSourceFileParser.parseInterface(interfaceName);
    if (!parsedInterface) {
      return {};
    }
    return this.transformParsedInterface(
      parsedInterface,
      interfaceName,
      onProp
    );
  }

  private transformParsedInterface(
    parsedInterface: ParsedInterface,
    interfaceName: string,
    onProp?: (propName: string) => boolean
  ): PropShape {
    const propShape: PropShape = {};
    Object.keys(parsedInterface).forEach((propName) => {
      const prop = parsedInterface[propName];
      if (prop.kind !== ParsedInterfaceKind.Simple) {
        const nestedShape = this.transformParsedInterface(
          prop.type,
          interfaceName,
          onProp
        );
        const propMetadata: PropMetadata = {
          type: PropValueType.Object,
          shape: nestedShape,
        };
        propShape[propName] = propMetadata;
        return;
      }
      const { type, doc, unionValues } = prop;
      if (onProp && !onProp(propName)) {
        return;
      }

      if (!TypeGuards.isPropValueType(type) || type === PropValueType.Object) {
        throw new Error(
          `Unrecognized type ${type} in interface ${interfaceName}`
        );
      }
      if (
        !TypeGuards.isPrimitiveProp(type) &&
        !this.studioImports.includes(type)
      ) {
        throw new Error(
          `Missing import from ${STUDIO_PACKAGE_NAME} for ${type} in interface for ${interfaceName}.`
        );
      }
      if (unionValues) {
        propShape[propName] = {
          type: PropValueType.string,
          ...(doc && { doc }),
          unionValues,
        };
      } else {
        propShape[propName] = {
          type,
          ...(doc && { doc }),
        };
      }
    });
    return propShape;
  }
}
