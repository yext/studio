import { PropVal, PropValueKind, PropValueType } from "@yext/studio-plugin";
import TemplateExpressionFormatter from "./TemplateExpressionFormatter";

export default class PropValueHelpers {
  static getPropTypeDefaultValue(
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
    if (typeof value === "object") {
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
    if (
      TemplateExpressionFormatter.isNonTemplateStringExpression({
        kind,
        value,
        valueType: PropValueType.string,
      })
    ) {
      return TemplateExpressionFormatter.addBackticks("${" + value + "}");
    }

    if (kind === PropValueKind.Literal) {
      return TemplateExpressionFormatter.addBackticks(value);
    }
    return value;
  }
}
