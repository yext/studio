import {
  ComponentStateKind,
  ComponentState,
  PageState,
} from "@yext/studio-plugin";

/**
 * Iterates through a record of PageStates and removes all top
 * level fragments from their componentTrees.
 */
export default function removeTopLevelFragments(
  record: Record<string, PageState>
): Record<string, PageState> {
  const entries = Object.entries(record).map(([pageName, pageState]) => {
    const updatedContainer = {
      ...pageState,
      componentTree: removeTopLevelFragmentsFromTree(pageState.componentTree),
    };
    return [pageName, updatedContainer];
  });
  return Object.fromEntries(entries);
}

function removeTopLevelFragmentsFromTree(
  tree: ComponentState[]
): ComponentState[] {
  const isRootLevelFragment = ({ parentUUID, kind }: ComponentState) =>
    parentUUID === undefined && kind === ComponentStateKind.Fragment;

  const rootLevelFragmentUUIDs = tree
    .filter(isRootLevelFragment)
    .map(({ uuid }) => uuid);

  const updatedTree = tree
    .filter((c) => !rootLevelFragmentUUIDs.includes(c.uuid))
    .map((c) => {
      if (c.parentUUID && rootLevelFragmentUUIDs.includes(c.parentUUID)) {
        return {
          ...c,
          parentUUID: undefined,
        };
      }
      return c;
    });
  return updatedTree;
}
