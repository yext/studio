import { ComponentState, FileMetadata, TypeGuards } from "@yext/studio-plugin";
import useStudioStore from "../store/useStudioStore";

/**
 * Returns the current activeComponentState and its corresponding activeComponentMetadata.
 */
export default function useActiveComponent(): {
  activeComponentMetadata?: FileMetadata;
  activeComponentState?: ComponentState;
} {
  return useStudioStore((store) => {
    const activeComponentState = store.pages.getActiveComponentState();
    const activeComponentMetadata =
      activeComponentState &&
      TypeGuards.isStandardOrModuleComponentState(activeComponentState)
        ? store.fileMetadatas.getFileMetadata(activeComponentState.metadataUUID)
        : undefined;
    return {
      activeComponentMetadata,
      activeComponentState,
    };
  });
}
