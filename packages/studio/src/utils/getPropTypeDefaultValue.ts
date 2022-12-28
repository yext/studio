import { PropValueType } from "@yext/studio-plugin"

export default function getPropTypeDefaultValue(type: PropValueType): string | number | boolean {
  switch (type) {
    case PropValueType.number:
      return 0
    case PropValueType.string:
      return ""
    case PropValueType.boolean:
      return false
    case PropValueType.HexColor:
      return "#000000"
    default:
      console.error(`Unknown PropValueType ${type}. Can't derive a default value based on PropValueType.`)
      return ""
  }
}
