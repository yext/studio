import { SyntaxKind } from "ts-morph";
import { PropShape } from "../types/PropShape";
import { PropValueKind, PropValues } from "../types/PropValues";
import StaticParsingHelpers, {
  ParsedObjectLiteral,
} from "../parsers/helpers/StaticParsingHelpers";
import StudioSourceFile from "../sourcefiles/StudioSourceFile";
import TypeGuards from "../parsers/helpers/TypeGuards";

/**
 * PropValuesParser is a class for parsing object literals in a Studio file into PropValues.
 */
export default class PropValuesParser {
  constructor(private studioSourceFile: StudioSourceFile) {}

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
      return this.studioSourceFile.parseExportedObjectLiteral(variableName);
    }
    const defaultExport = this.studioSourceFile.getDefaultExport();
    if (!defaultExport) {
      return undefined;
    }
    if (!defaultExport.isKind(SyntaxKind.ObjectLiteralExpression)) {
      throw new Error(
        `Expected an ObjectLiteralExpression as the default export in ${this.studioSourceFile.getFilepath()}`
      );
    }
    return StaticParsingHelpers.parseObjectLiteral(defaultExport);
  }

  private parseRawValues(
    rawValues: ParsedObjectLiteral,
    propShape: PropShape
  ): PropValues {
    const propValues: PropValues = {};
    Object.keys(rawValues).forEach((propName) => {
      const { value, isExpression } = rawValues[propName];
      if (isExpression) {
        throw new Error(`Expressions are not supported within object literal.`);
      }
      const propValue = {
        valueType: propShape[propName].type,
        kind: PropValueKind.Literal,
        value,
      };
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
