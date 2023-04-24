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
 * TypeNodeParser is a class for parsing a typescript interface.
 */
export default class TypeNodeParser {
  private studioImports: string[];

  constructor(private studioSourceFileParser: StudioSourceFileParser) {
    this.studioImports =
      this.studioSourceFileParser.parseNamedImports()[STUDIO_PACKAGE_NAME] ??
      [];
  }

  /**
   * Get the shape of a specific interface.
   */
  parseType(
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
    Object.keys(parsedInterface)
      .filter((propName) => !onProp || onProp(propName))
      .forEach((propName) => {
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
            required: prop.required,
          };
          propShape[propName] = propMetadata;
          return;
        }
        const { type, doc, unionValues } = prop;
        const sharedProperties = {
          ...(doc && { doc }),
          required: prop.required,
        };
        if (type === "Record<string, any>") {
          propShape[propName] = {
            type: PropValueType.Record,
            recordKey: "string",
            recordValue: "any",
            ...sharedProperties,
          };
          return;
        } else if (
          !TypeGuards.isPropValueType(type) ||
          type === PropValueType.Object
        ) {
          throw new Error(
            `Unrecognized type ${type} in interface ${interfaceName} within ${this.studioSourceFileParser.getFilepath()}`
          );
        } else if (type === PropValueType.Record) {
          throw new Error("Only Records of Record<string, any> are supported.");
        } else if (
          !TypeGuards.isPrimitiveProp(type) &&
          !this.studioImports.includes(type)
        ) {
          throw new Error(
            `Missing import from ${STUDIO_PACKAGE_NAME} for ${type} in interface ${interfaceName} within ${this.studioSourceFileParser.getFilepath()}.`
          );
        } else if (unionValues) {
          propShape[propName] = {
            type: PropValueType.string,
            unionValues,
            ...sharedProperties,
          };
        } else {
          propShape[propName] = {
            type,
            ...sharedProperties,
          };
        }
      });
    return propShape;
  }
}
