import { PropMetadata, PropShape, PropType } from "../types/PropShape";
import TypeGuards, { StudioPropValueType } from "../utils/TypeGuards";
import { STUDIO_PACKAGE_NAME } from "../constants";
import StudioSourceFileParser from "./StudioSourceFileParser";
import { PropValueType } from "../types";
import {
  ParsedProperty,
  ParsedShape,
  ParsedType,
  ParsedTypeKind,
} from "./helpers/TypeNodeParsingHelper";
import { NamedImport } from "./helpers/StaticParsingHelpers";

type StudioPropTypeImport = NamedImport & { name: StudioPropValueType };

/**
 * PropShapeParser is a class for parsing a typescript interface into a PropShape.
 */
export default class PropShapeParser {
  private studioPropTypeImports: StudioPropTypeImport[];

  constructor(private studioSourceFileParser: StudioSourceFileParser) {
    this.studioPropTypeImports =
      this.studioSourceFileParser
        .parseNamedImports()
        [STUDIO_PACKAGE_NAME]?.filter((i): i is StudioPropTypeImport =>
          TypeGuards.isStudioPropValueType(i.name)
        ) ?? [];
  }

  /**
   * Get the PropShape of a specific type or interface.
   */
  parseShape(
    identifier: string,
    onProp?: (propName: string) => boolean
  ): PropShape {
    const parsedType =
      this.studioSourceFileParser.parseTypeReference(identifier);
    if (!parsedType) {
      return {};
    }
    if (parsedType.kind !== ParsedTypeKind.Object) {
      throw new Error(`Error parsing ${identifier}: Expected object.`);
    }
    return this.toPropShape(parsedType.type, identifier, onProp);
  }

  private toPropShape(
    rawProps: ParsedShape,
    identifier: string,
    onProp?: (propName: string) => boolean
  ): PropShape {
    const propShape: PropShape = {};
    Object.keys(rawProps)
      .filter((propName) => !onProp || onProp(propName))
      .forEach((propName) => {
        const rawProp = rawProps[propName];
        propShape[propName] = this.toPropMetadata(rawProp, identifier, onProp);
      });
    return propShape;
  }

  private toPropMetadata(
    rawProp: ParsedProperty,
    identifier: string,
    onProp?: (propName: string) => boolean
  ): PropMetadata {
    const { required, doc } = rawProp;
    return {
      ...(doc && { doc }),
      required,
      ...this.getPropType(rawProp, identifier, onProp),
    };
  }

  private getPropType(
    parsedType: ParsedType,
    identifier: string,
    onProp?: (propName: string) => boolean
  ): PropType {
    const { kind, type, unionValues } = parsedType;

    if (kind === ParsedTypeKind.Array) {
      const itemType = this.getPropType(type, identifier, onProp);
      return {
        type: PropValueType.Array,
        itemType,
      };
    } else if (kind === ParsedTypeKind.Object) {
      const nestedShape = this.toPropShape(type, identifier, onProp);
      return {
        type: PropValueType.Object,
        shape: nestedShape,
      };
    } else if (type === "Record<string, any>") {
      return {
        type: PropValueType.Record,
        recordKey: "string",
        recordValue: "any",
      };
    } else {
      const matchingImport = this.studioPropTypeImports.find(
        (i) => type === (i.alias ?? i.name)
      );
      if (matchingImport) {
        return { type: matchingImport.name };
      } else if (TypeGuards.isStudioPropValueType(type)) {
        throw new Error(
          `Prop type ${type} is invalid since it is not imported from ${STUDIO_PACKAGE_NAME}`
        );
      } else if (
        !TypeGuards.isPropValueType(type) ||
        type === PropValueType.Object ||
        type === PropValueType.Array
      ) {
        throw new Error(
          `Unrecognized type ${type} in ${identifier} within ${this.studioSourceFileParser.getFilename()}`
        );
      } else if (type === PropValueType.Record) {
        throw new Error("Only Records of Record<string, any> are supported.");
      } else if (unionValues) {
        return {
          type: PropValueType.string,
          unionValues,
        };
      } else {
        return {
          type,
        };
      }
    }
  }
}
