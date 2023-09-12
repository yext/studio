import { ComponentState, ComponentStateKind, FileMetadata } from "@yext/studio-plugin";
import useStudioStore from "../store/useStudioStore";

/**
 * Returns the current activeComponentState and its corresponding activeComponentMetadata.
 */
export default function useActiveComponent(): {
  activeComponentMetadata?: FileMetadata;
  activeComponentState?: ComponentState;
} {
  return useStudioStore((store) => {
    const activeComponentState = store.actions.getActiveComponentState();
    const activeComponentMetadata =
      activeComponentState &&
      activeComponentState.kind === ComponentStateKind.Standard
        ? store.fileMetadatas.getFileMetadata(activeComponentState.metadataUUID)
        : undefined;
    return {
      activeComponentMetadata,
      activeComponentState,
    };
  });
}
