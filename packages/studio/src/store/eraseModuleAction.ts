import { StudioStore } from "./models/store";
import {
  ComponentStateKind,
  ModuleMetadata,
} from "@yext/studio-plugin";

export default function getEraseModuleAction(
  get: () => StudioStore
): StudioStore["eraseModule"] {
  return (metadata: ModuleMetadata) => {
    const store = get();
    store.pages.setActiveComponentUUID(undefined);
    const activePageState = store.pages.getActivePageState();
    if (activePageState) {
      const updatedComponentTree =
        activePageState?.componentTree.filter((c) => {
          if (c.kind !== ComponentStateKind.Module) {
            return true;
          }
          return c.metadataUUID !== metadata.metadataUUID;
        }) ?? [];
      store.pages.setActivePageState({
        ...activePageState,
        componentTree: updatedComponentTree,
      });
    }
    store.fileMetadatas.removeFileMetadata(metadata.metadataUUID);
  };
}
