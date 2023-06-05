import { PropVal, PropValueKind, PropValueType } from "@yext/studio-plugin";
import TemplateExpressionFormatter from "./TemplateExpressionFormatter";

export default class PropValueHelpers {
  static getPropInputDefaultValue(
    type: PropValueType,
    kind: PropValueKind
  ): string | number | boolean {
    if (kind === PropValueKind.Literal) {
      return this.getLiteralPropDefaultValue(type);
    }
    switch (type) {
      case PropValueType.string:
        return "``";
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
  ): string | number | boolean {
    switch (type) {
      case PropValueType.number:
        return 0;
      case PropValueType.string:
        return "";
      case PropValueType.boolean:
        return false;
      case PropValueType.HexColor:
        return "#FFFFFF";
      default:
        console.error(
          `Unknown PropValueType ${type}. Can't derive a default value based on PropValueType.`
        );
        return "";
    }
  }

  static getPropValue(
    propVal: PropVal | undefined,
    expectedPropKind: PropValueKind
  ): string | number | boolean | undefined {
    if (!propVal) {
      return undefined;
    }

    const { value, valueType } = propVal;
    if (valueType === PropValueType.Object) {
      throw new Error(
        `Unexpected object prop ${JSON.stringify(propVal, null, 2)}`
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
