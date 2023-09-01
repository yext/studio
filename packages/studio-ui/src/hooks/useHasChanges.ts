import useStudioStore from "../store/useStudioStore";
import { isEqual } from "lodash";

export default function useHasChanges() {
  // TODO(SLAP-2556) Refactor pendingChanges to use PreviousSaveSlice
  const [pagesToRemove, pagesToUpdate] = useStudioStore((store) => [
    store.pages.pendingChanges.pagesToRemove,
    store.pages.pendingChanges.pagesToUpdate,
  ]);
  const UUIDToFileMetadata = useStudioStore(
    (store) => store.fileMetadatas.UUIDToFileMetadata
  );
  const previousSave = useStudioStore((store) => store.previousSave);
  const siteSettingsValues = useStudioStore(
    (store) => store.siteSettings.values
  );

  const siteSettingsHaveChanged = !isEqual(
    previousSave.siteSettings.values,
    siteSettingsValues
  );
  const hasFileMetadataChanges = !isEqual(
    previousSave.fileMetadatas.UUIDToFileMetadata,
    UUIDToFileMetadata
  );

  return (
    pagesToRemove.size > 0 ||
    pagesToUpdate.size > 0 ||
    siteSettingsHaveChanged ||
    hasFileMetadataChanges
  );
}
