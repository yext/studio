import { PropMetadata, PropShape, PropType } from "../types/PropShape";
import TypeGuards from "../utils/TypeGuards";
import { STUDIO_PACKAGE_NAME } from "../constants";
import StudioSourceFileParser from "./StudioSourceFileParser";
import { PropValueType } from "../types";
import {
  ParsedProperty,
  ParsedShape,
  ParsedType,
  ParsedTypeKind,
} from "./helpers/TypeNodeParsingHelpers";

/**
 * PropShapeParser is a class for parsing a typescript interface into a PropShape.
 */
export default class PropShapeParser {
  constructor(private studioSourceFileParser: StudioSourceFileParser) {}

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
      throw new Error(`Unable to resolve type ${identifier}.`);
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
    const { required, tooltip, displayName } = rawProp;
    return {
      ...(tooltip && { tooltip }),
      ...(displayName && { displayName }),
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

    if (kind === ParsedTypeKind.StringLiteral) {
      return {
        type: PropValueType.string,
        unionValues: [type],
      };
    } else if (kind === ParsedTypeKind.Studio) {
      return {
        type,
      };
    } else if (kind === ParsedTypeKind.Array) {
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
    } else if (TypeGuards.isStudioPropValueType(type)) {
      throw new Error(
        `Prop type ${type} is invalid because it is not imported from ${STUDIO_PACKAGE_NAME}`
      );
    } else if (type === "Record<string, any>") {
      return {
        type: PropValueType.Record,
        recordKey: "string",
        recordValue: "any",
      };
    } else if (
      type === PropValueType.Record ||
      type.startsWith(PropValueType.Record + "<")
    ) {
      throw new Error("Only Records of Record<string, any> are supported.");
    } else if (!TypeGuards.isPrimitiveProp(type)) {
      throw new Error(
        `Unrecognized type ${type} in ${identifier} within ${this.studioSourceFileParser.getFilename()}`
      );
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
