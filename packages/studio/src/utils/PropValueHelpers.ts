import {
  PropType,
  PropVal,
  PropValueKind,
  PropValueType,
  TypeGuards,
} from "@yext/studio-plugin";
import TemplateExpressionFormatter from "./TemplateExpressionFormatter";

export default class PropValueHelpers {
  static getPropInputDefaultValue(
    type: PropValueType,
    kind: PropValueKind
  ): string | number | boolean {
    switch (type) {
      case PropValueType.number:
        return 0;
      case PropValueType.string:
        return kind === PropValueKind.Expression ? "``" : "";
      case PropValueType.boolean:
        return false;
      case PropValueType.HexColor:
        return "#FFFFFF";
      case PropValueType.Array:
        return "";
      default:
        console.error(
          `Unknown PropValueType ${type}. Can't derive a default value based on PropValueType.`
        );
        return "";
    }
  }

  static getLiteralPropDefaultValue(
    type: PropValueType
  ): string | number | boolean | unknown[] | undefined {
    switch (type) {
      case PropValueType.number:
      case PropValueType.string:
      case PropValueType.boolean:
      case PropValueType.HexColor:
        return this.getPropInputDefaultValue(type, PropValueKind.Literal);
      case PropValueType.Array:
        return [];
      default:
        return undefined;
    }
  }

  static getDefaultPropVal(propType: PropType): PropVal {
    const getDefaultValue = () => {
      if (propType.type !== PropValueType.Object) {
        return PropValueHelpers.getLiteralPropDefaultValue(propType.type);
      }

      const propValEntries = Object.entries(propType.shape).map(
        ([name, propMetadata]) => [name, this.getDefaultPropVal(propMetadata)]
      );
      return Object.fromEntries(propValEntries);
    };

    const propVal = {
      kind: PropValueKind.Literal,
      valueType: propType.type,
      value: getDefaultValue(),
    };
    TypeGuards.assertIsValidPropVal(propVal);
    return propVal;
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
