import { PropValueKind, PropValueType } from "@yext/studio-plugin";

export default function getPropTypeDefaultValue(
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
