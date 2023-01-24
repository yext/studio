import PageSlice, { PagesRecord } from "../../models/slices/PageSlice";
import {
  ComponentState,
  ComponentStateKind,
  ComponentTreeHelpers,
  ModuleMetadata,
} from "@yext/studio-plugin";
import { v4 } from "uuid";
import { isEqual } from "lodash";

/**
 * Creates an action that loops through all pages, and detaches all instances of the given module.
 */
export default function createDetachAllModuleInstances(
  get: () => PageSlice,
  set: (callback: (nextState: PageSlice) => void) => void
) {
  return (metadata: ModuleMetadata) => {
    const pagesSlice = get();
    pagesSlice.setActiveComponentUUID(undefined);
    const updatedPages: PagesRecord = Object.keys(pagesSlice.pages).reduce(
      (allPages, pageName) => {
        const originalPage = pagesSlice.pages[pageName];
        const updatedComponentTree = detachModuleInstances(
          metadata,
          originalPage.componentTree
        );
        if (!isEqual(originalPage.componentTree, updatedComponentTree)) {
          set((pagesSlice) => {
            pagesSlice.pendingChanges.pagesToUpdate.add(pageName);
          });
        }
        allPages[pageName] = {
          ...originalPage,
          componentTree: updatedComponentTree,
        };
        return allPages;
      },
      {} as PagesRecord
    );
    pagesSlice.setPagesRecord(updatedPages);
  };
}

/**
 * Loops through the given componentTree, and detaches all modules that are instances
 * of the passed in ModuleMetadata.
 */
function detachModuleInstances(
  metadata: ModuleMetadata,
  componentTree: ComponentState[]
) {
  return componentTree.flatMap((componentStateToDetach) => {
    const isModule = componentStateToDetach.kind === ComponentStateKind.Module;
    if (
      !isModule ||
      componentStateToDetach.metadataUUID !== metadata.metadataUUID
    ) {
      return componentStateToDetach;
    }
    const detachedTree =
      ComponentTreeHelpers.mapComponentTreeParentsFirst<ComponentState>(
        metadata.componentTree,
        (child, parentValue) => {
          return {
            ...child,
            uuid: v4(),
            parentUUID: parentValue?.uuid ?? componentStateToDetach.parentUUID,
          };
        }
      );
    return detachedTree;
  });
}
