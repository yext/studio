import {
  PropShape,
  PropType,
  PropVal,
  PropValueKind,
  PropValueType,
  PropValues,
  TypeGuards,
} from "@yext/studio-plugin";
import TemplateExpressionFormatter from "./TemplateExpressionFormatter";

export default class PropValueHelpers {
  static getPropInputDefaultValue(
    propType: PropType,
    kind: PropValueKind
  ): string | number | boolean {
    switch (propType.type) {
      case PropValueType.number:
        return 0;
      case PropValueType.string:
        if (propType.unionValues?.length) {
          return propType.unionValues[0];
        }
        return kind === PropValueKind.Expression ? "``" : "";
      case PropValueType.boolean:
        return false;
      case PropValueType.HexColor:
        return "#FFFFFF";
      case PropValueType.Array:
      case PropValueType.TailwindClass:
        return "";
      default:
        console.error(
          `Unknown PropValueType ${propType.type}. Can't derive a default value based on PropValueType.`
        );
        return "";
    }
  }

  static getLiteralPropDefaultValue(
    propType: PropType
  ): string | number | boolean | unknown[] | undefined {
    switch (propType.type) {
      case PropValueType.number:
      case PropValueType.string:
      case PropValueType.boolean:
      case PropValueType.HexColor:
      case PropValueType.TailwindClass:
        return this.getPropInputDefaultValue(propType, PropValueKind.Literal);
      case PropValueType.Array:
        return [];
      default:
        return undefined;
    }
  }

  static getDefaultPropVal(propType: PropType): PropVal {
    const isRecord = propType.type === PropValueType.Record;

    const getDefaultValue = () => {
      if (isRecord) {
        return "document";
      }
      if (propType.type !== PropValueType.Object) {
        return PropValueHelpers.getLiteralPropDefaultValue(propType);
      }
      return this.getDefaultPropValues(propType.shape);
    };

    const propVal = {
      kind: isRecord ? PropValueKind.Expression : PropValueKind.Literal,
      valueType: propType.type,
      value: getDefaultValue(),
    };
    TypeGuards.assertIsValidPropVal(propVal);
    return propVal;
  }

  static getDefaultPropValues(propShape: PropShape): PropValues {
    return Object.fromEntries(
      Object.entries(propShape)
        .filter(([_, propMetadata]) => propMetadata.required)
        .map(([name, propMetadata]) => [
          name,
          this.getDefaultPropVal(propMetadata),
        ])
    );
  }

  static getPropValue(
    propVal: PropVal | undefined,
    expectedPropKind: PropValueKind
  ): string | number | boolean | undefined {
    if (!propVal) {
      return undefined;
    }

    const { value, valueType } = propVal;
    if (
      valueType === PropValueType.Object ||
      valueType === PropValueType.Array
    ) {
      throw new Error(
        `Unexpected ${valueType} prop ${JSON.stringify(propVal, null, 2)}`
      );
    }

    if (
      expectedPropKind === PropValueKind.Expression &&
      valueType === PropValueType.string
    ) {
      return this.getTemplateExpression(propVal);
    }

    return value;
  }

  static getTemplateExpression({
    kind,
    value,
  }: {
    kind: PropValueKind;
    value: string;
  }): string {
    const isPropertyAccessExpresion =
      kind === PropValueKind.Expression &&
      !TemplateExpressionFormatter.hasBackticks(value);

    if (isPropertyAccessExpresion) {
      return TemplateExpressionFormatter.addBackticks("${" + value + "}");
    }

    if (kind === PropValueKind.Literal) {
      return TemplateExpressionFormatter.addBackticks(value);
    }

    return value;
  }
}
