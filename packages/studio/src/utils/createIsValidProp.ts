import {
  StandardOrModuleComponentState,
  PropMetadata,
  NestedPropMetadata,
  PropValueType,
} from "@yext/studio-plugin";

export default function createIsValidProp(
  activeComponentState: StandardOrModuleComponentState
) {
  return function isValidProp(
    entry: [string, PropMetadata]
  ): entry is [string, Exclude<PropMetadata, NestedPropMetadata>] {
    const [propName, propMetadata] = entry;
    if (propMetadata.type === PropValueType.ReactNode) {
      console.warn(
        `Found ${propName} in component ${activeComponentState.componentName} with PropValueType.ReactNode.` +
          " Studio does not support editing prop of type ReactNode."
      );
      return false;
    }

    if (propMetadata.type === PropValueType.Object) {
      console.warn(
        `Found ${propName} in component ${activeComponentState.componentName} with PropValueType.Object.` +
          " Studio does not support editing nested props."
      );
      return false;
    }

    return true;
  };
}
