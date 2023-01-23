import { StudioStore } from "./models/store";
import {
  ComponentState,
  ComponentStateKind,
  ComponentTreeHelpers,
  ModuleMetadata,
} from "@yext/studio-plugin";
import { v4 } from "uuid";

/**
 * getDeleteModuleAction is a factory method for the deleteModule action.
 */
export default function getDeleteModuleAction(
  get: () => StudioStore
): StudioStore["deleteModule"] {
  return (metadata: ModuleMetadata) => {
    const store = get();
    store.pages.setActiveComponentUUID(undefined);
    const activePageState = store.pages.getActivePageState();
    if (activePageState) {
      const updatedComponentTree = detachModuleInstances(
        metadata,
        activePageState.componentTree
      );
      store.pages.setActivePageState({
        ...activePageState,
        componentTree: updatedComponentTree,
      });
    }
    store.fileMetadatas.removeFileMetadata(metadata.metadataUUID);
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
