import {
  PropMetadata,
  PropValueType,
  RecordPropType,
} from "@yext/studio-plugin";

/**
 * Generates a typeguard used to ensure that a specific {@link PropMetadata}
 * is neither a {@link PropValueType.ReactNode} nor a
 * {@link PropValueType.Record}.
 * These are types that we don't support editing via the UI.
 */
export default function createIsSupportedPropMetadata(componentName: string) {
  return function isSupportedPropMetadata(
    entry: [string, PropMetadata]
  ): entry is [string, Exclude<PropMetadata, RecordPropType>] {
    const [propName, propMetadata] = entry;
    if (propMetadata.type === PropValueType.ReactNode) {
      console.warn(
        `Found ${propName} in component ${componentName} with PropValueType.ReactNode.` +
          " Studio does not support editing prop of type ReactNode."
      );
      return false;
    }

    return propMetadata.type !== PropValueType.Record;
  };
}
