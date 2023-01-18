import { SyntaxKind } from "ts-morph";
import { PropShape } from "../types/PropShape";
import { PropValueKind, PropValues, PropValueType } from "../types/PropValues";
import StaticParsingHelpers, {
  ParsedObjectLiteral,
} from "../parsers/helpers/StaticParsingHelpers";
import TypeGuards from "../utils/TypeGuards";
import StudioSourceFileParser from "./StudioSourceFileParser";

/**
 * PropValuesParser is a class for parsing object literals in a Studio file into PropValues.
 */
export default class PropValuesParser {
  constructor(private studioSourceFileParser: StudioSourceFileParser) {}

  /**
   * Parses the given exported variable into PropValues.
   * If no variableName is provided, the default export will be parsed
   *
   * @param propShape - Shape of the component's props
   * @param variableName - the variable to parse into PropValues.
   */
  parsePropValues(
    propShape: PropShape,
    variableName?: string
  ): PropValues | undefined {
    const rawValues = this.getRawValues(variableName);
    if (!rawValues) {
      return undefined;
    }
    return this.parseRawValues(rawValues, propShape);
  }

  private getRawValues(variableName?: string): ParsedObjectLiteral | undefined {
    if (variableName) {
      return this.studioSourceFileParser.parseExportedObjectLiteral(
        variableName
      );
    }
    const defaultExport = this.studioSourceFileParser.getDefaultExport();
    if (!defaultExport) {
      return undefined;
    }
    if (!defaultExport.isKind(SyntaxKind.ObjectLiteralExpression)) {
      throw new Error(
        `Expected an ObjectLiteralExpression as the default export in ${this.studioSourceFileParser.getFilepath()}`
      );
    }
    return StaticParsingHelpers.parseObjectLiteral(defaultExport);
  }

  private parseRawValues(
    rawValues: ParsedObjectLiteral,
    propShape: PropShape
  ): PropValues {
    const propValues: PropValues = {};

    const getPropValue = (propName: string) => {
      const { value } = rawValues[propName];
      if (typeof value === "object") {
        const childShape = propShape[propName];
        if (childShape.type !== PropValueType.Object) {
          throw new Error(
            `Expected PropValueType.Object for ${propName} in ${JSON.stringify(
              propShape,
              null,
              2
            )}`
          );
        }
        return {
          valueType: PropValueType.Object,
          kind: PropValueKind.Literal,
          value: this.parseRawValues(value, childShape.shape),
        };
      }

      return {
        valueType: propShape[propName].type,
        kind: PropValueKind.Literal,
        value,
      };
    };

    Object.keys(rawValues).forEach((propName) => {
      const { isExpression } = rawValues[propName];
      if (isExpression) {
        throw new Error(`Expressions are not supported within object literal.`);
      }
      const propValue = getPropValue(propName);
      if (!TypeGuards.isValidPropValue(propValue)) {
        throw new Error(
          "Invalid prop value: " + JSON.stringify(propValue, null, 2)
        );
      }
      propValues[propName] = propValue;
    });
    return propValues;
  }
}
