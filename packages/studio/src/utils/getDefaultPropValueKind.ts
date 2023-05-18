import {
  PropMetadata,
  PropValueKind,
  PropValueType,
} from "@yext/studio-plugin";

export default function getDefaultPropValueKind(propMetadata: PropMetadata) {
  if (propMetadata.type === PropValueType.string && !propMetadata.unionValues) {
    return PropValueKind.Expression;
  }
  return PropValueKind.Literal;
}
