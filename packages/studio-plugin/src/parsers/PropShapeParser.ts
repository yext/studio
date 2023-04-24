import { PropMetadata, PropShape } from "../types/PropShape";
import TypeGuards from "../utils/TypeGuards";
import { STUDIO_PACKAGE_NAME } from "../constants";
import StudioSourceFileParser from "./StudioSourceFileParser";
import { PropValueType } from "../types";
import { ParsedShape, ParsedShapeKind } from "./helpers/ShapeParsingHelper";

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
   * Get the shape of a specific type or interface.
   */
  parseShape(
    identifier: string,
    onProp?: (propName: string) => boolean
  ): PropShape {
    const parsedShape = this.studioSourceFileParser.parseShape(identifier);
    if (!parsedShape) {
      return {};
    }
    return this.transformParsedInterface(parsedShape, identifier, onProp);
  }

  private transformParsedInterface(
    parsedInterface: ParsedShape,
    identifier: string,
    onProp?: (propName: string) => boolean
  ): PropShape {
    const propShape: PropShape = {};
    Object.keys(parsedInterface)
      .filter((propName) => !onProp || onProp(propName))
      .forEach((propName) => {
        const prop = parsedInterface[propName];
        if (prop.kind !== ParsedShapeKind.Simple) {
          const nestedShape = this.transformParsedInterface(
            prop.type,
            identifier,
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
