import { SyntaxKind } from "ts-morph";
import { PropShape, PropType } from "../types/PropShape";
import {
  PropVal,
  PropValueKind,
  PropValues,
  PropValueType,
  TypelessPropVal,
} from "../types/PropValues";
import StaticParsingHelpers from "../parsers/helpers/StaticParsingHelpers";
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

  private getRawValues(
    variableName?: string
  ): Record<string, TypelessPropVal> | undefined {
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
    rawValues: Record<string, TypelessPropVal>,
    propShape: PropShape
  ): PropValues {
    const propValues: PropValues = {};

    Object.keys(rawValues).forEach((propName) => {
      propValues[propName] = this.parseRawVal(
        propName,
        rawValues[propName],
        propShape[propName],
        propShape
      );
    });
    return propValues;
  }

  private parseRawVal(
    propName: string,
    rawVal: TypelessPropVal,
    propType: PropType,
    propShape: PropShape
  ): PropVal {
    if (rawVal.kind === PropValueKind.Expression) {
      throw new Error(`Expressions are not supported within object literal.`);
    }
    const typeMatchErrorMessage = `Error parsing value of ${propName} in ${JSON.stringify(
      propShape,
      null,
      2
    )}: Expected value ${rawVal} to match PropType ${propType}`;

    const getPropVal = () => {
      const { value } = rawVal;
      if (Array.isArray(value)) {
        if (propType.type !== PropValueType.Array) {
          throw new Error(typeMatchErrorMessage);
        }
        return {
          valueType: PropValueType.Array,
          kind: PropValueKind.Literal,
          value: value.map((val) =>
            this.parseRawVal(propName, val, propType.itemType, propShape)
          ),
        };
      } else if (typeof value === "object") {
        if (propType.type !== PropValueType.Object) {
          throw new Error(typeMatchErrorMessage);
        }
        return {
          valueType: PropValueType.Object,
          kind: PropValueKind.Literal,
          value: this.parseRawValues(value, propType.shape),
        };
      }

      return {
        valueType: propType.type,
        kind: PropValueKind.Literal,
        value,
      };
    };

    const propVal = getPropVal();
    TypeGuards.assertIsValidPropVal(propVal);
    return propVal;
  }
}
