import { StudioStore } from "./models/store";
import {
  ComponentState,
  ComponentStateKind,
  ComponentTreeHelpers,
  ModuleMetadata,
} from "@yext/studio-plugin";
import { cloneDeep } from "lodash";
import { v4 } from "uuid";

export default function getDeleteModuleAction(
  get: () => StudioStore
): StudioStore["deleteModule"] {
  return (metadata: ModuleMetadata) => {
    const store = get();
    store.pages.setActiveComponentUUID(undefined);
    const activePageState = store.pages.getActivePageState();
    if (activePageState) {
      const updatedComponentTree =
        activePageState?.componentTree.flatMap((componentStateToDetach) => {
          const isModule =
            componentStateToDetach.kind === ComponentStateKind.Module;
          if (
            !isModule ||
            componentStateToDetach.metadataUUID !== metadata.metadataUUID
          ) {
            return componentStateToDetach;
          }
          const detachedTree =
            ComponentTreeHelpers.mapComponentTreeParentsFirst<ComponentState>(
              cloneDeep(metadata.componentTree),
              (child, parentValue) => {
                return {
                  ...child,
                  uuid: v4(),
                  parentUUID:
                    parentValue?.uuid ?? componentStateToDetach.parentUUID,
                };
              }
            );
          return detachedTree;
        }) ?? [];
      store.pages.setActivePageState({
        ...activePageState,
        componentTree: updatedComponentTree,
      });
    }
    store.fileMetadatas.removeFileMetadata(metadata.metadataUUID);
  };
}
