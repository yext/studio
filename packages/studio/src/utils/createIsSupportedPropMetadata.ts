import {
  PropMetadata,
  NestedPropMetadata,
  PropValueType,
} from "@yext/studio-plugin";

/**
 * Generates a typeguard used to ensure that a specific {@link PropMetadata}
 * is not either a {@link PropValueType.ReactNode} or a {@link PropValueType.Object},
 * which are types that we don't support editing via the UI.
 */
export default function createIsSupportedPropMetadata(componentName: string) {
  return function isSupportedPropMetadata(
    entry: [string, PropMetadata]
  ): entry is [string, Exclude<PropMetadata, NestedPropMetadata>] {
    const [propName, propMetadata] = entry;
    if (propMetadata.type === PropValueType.ReactNode) {
      console.warn(
        `Found ${propName} in component ${componentName} with PropValueType.ReactNode.` +
          " Studio does not support editing prop of type ReactNode."
      );
      return false;
    }

    if (propMetadata.type === PropValueType.Object) {
      console.warn(
        `Found ${propName} in component ${componentName} with PropValueType.Object.` +
          " Studio does not support editing nested props."
      );
      return false;
    }

    return true;
  };
}
