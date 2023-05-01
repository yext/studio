import { PropMetadata, PropShape } from "../types/PropShape";
import TypeGuards from "../utils/TypeGuards";
import { STUDIO_PACKAGE_NAME } from "../constants";
import StudioSourceFileParser from "./StudioSourceFileParser";
import { PropValueType } from "../types";
import {
  ParsedProperty,
  ParsedTypeKind,
  ParsedShape,
} from "./helpers/ShapeParsingHelper";

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
      throw new Error(
        `Expected a ParsedTypeKind.Object for "${identifier}", received "${parsedType.kind}".`
      );
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
    if (rawProp.kind !== ParsedTypeKind.Simple) {
      const nestedShape = this.toPropShape(rawProp.type, identifier, onProp);
      const propMetadata: PropMetadata = {
        type: PropValueType.Object,
        shape: nestedShape,
        required: rawProp.required,
      };
      return propMetadata;
    }
    const { type, doc, unionValues } = rawProp;
    const sharedProperties = {
      ...(doc && { doc }),
      required: rawProp.required,
    };
    if (type === "Record<string, any>") {
      return {
        type: PropValueType.Record,
        recordKey: "string",
        recordValue: "any",
        ...sharedProperties,
      };
    }

    if (!TypeGuards.isPropValueType(type) || type === PropValueType.Object) {
      throw new Error(
        `Unrecognized type ${type} in ${identifier} within ${this.studioSourceFileParser.getFilepath()}`
      );
    } else if (type === PropValueType.Record) {
      throw new Error("Only Records of Record<string, any> are supported.");
    } else if (
      !TypeGuards.isPrimitiveProp(type) &&
      !this.studioImports.includes(type)
    ) {
      throw new Error(
        `Missing import from ${STUDIO_PACKAGE_NAME} for ${type} in ${identifier} within ${this.studioSourceFileParser.getFilepath()}.`
      );
    }

    if (unionValues) {
      return {
        type: PropValueType.string,
        unionValues,
        ...sharedProperties,
      };
    }
    return {
      type,
      ...sharedProperties,
    };
  }
}
