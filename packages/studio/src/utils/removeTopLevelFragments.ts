import {
  ComponentStateKind,
  ComponentState,
  FileMetadata,
  PageState,
} from "@yext/studio-plugin";

/**
 * Iterates through a record of objects that contain a componentTree,
 * and removes all top level fragments.
 */
export default function removeTopLevelFragments<
  T extends PageState | FileMetadata
>(record: Record<string, T>): Record<string, T> {
  const entries = Object.entries(record).map(
    ([key, componentTreeContainer]) => {
      if (!("componentTree" in componentTreeContainer)) {
        return [key, componentTreeContainer];
      }

      const updatedContainer = {
        ...componentTreeContainer,
        componentTree: removeTopLevelFragmentsFromTree(
          componentTreeContainer.componentTree
        ),
      };
      return [key, updatedContainer];
    }
  );
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
