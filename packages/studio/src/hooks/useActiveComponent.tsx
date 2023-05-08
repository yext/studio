import {
  ComponentState,
  ComponentStateKind,
  FileMetadata,
  FileMetadataKind,
  TypeGuards,
} from "@yext/studio-plugin";
import useStudioStore from "../store/useStudioStore";
import { ErrorFileMetadata } from "@yext/studio-plugin/lib/types/ErrorFileMetadata";

/**
 * Returns the current activeComponentState and its corresponding activeComponentMetadata.
 */
export default function useActiveComponent(): {
  activeComponentMetadata?: Exclude<FileMetadata, ErrorFileMetadata>;
  activeComponentState?: ComponentState;
} {
  return useStudioStore((store) => {
    const activeComponentState = store.actions.getActiveComponentState();
    const activeComponentMetadata =
      activeComponentState &&
      TypeGuards.isStandardOrModuleComponentState(activeComponentState)
        ? store.fileMetadatas.getFileMetadata(activeComponentState.metadataUUID)
        : activeComponentState?.kind === ComponentStateKind.Repeater
        ? store.fileMetadatas.getFileMetadata(
            activeComponentState.repeatedComponent.metadataUUID
          )
        : undefined;
    if (activeComponentMetadata?.kind === FileMetadataKind.Error) {
      throw new Error(`ErrorFileMetadata cannot be the active component`);
    }
    return {
      activeComponentMetadata,
      activeComponentState,
    };
  });
}
