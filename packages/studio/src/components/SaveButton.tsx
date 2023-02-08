import useStudioStore from "../store/useStudioStore";
import { isEqual } from "lodash";

/**
 * Renders a button for saving changes to user's files.
 */
export default function SaveButton() {
  const hasChanges = useHasChanges();
  const saveChanges = useStudioStore((store) => store.saveChanges);

  return (
    <button
      className="ml-4 py-1 px-3 text-white rounded-md disabled:bg-gray-400 bg-blue-600"
      onClick={saveChanges}
      disabled={!hasChanges}
      aria-label="Save Changes to Repository"
    >
      Save
    </button>
  );
}

function useHasChanges() {
  // TODO(SLAP-2556) Refactor pendingChanges to use PreviousSaveSlice
  const [pagesToRemove, pagesToUpdate] = useStudioStore((store) => [
    store.pages.pendingChanges.pagesToRemove,
    store.pages.pendingChanges.pagesToUpdate,
  ]);
  const { modulesToUpdate } = useStudioStore(
    (store) => store.fileMetadatas.pendingChanges
  );
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
  console.log(previousSave.fileMetadatas.UUIDToFileMetadata, UUIDToFileMetadata)
  Object.keys(UUIDToFileMetadata).forEach(k => {
    console.log(isEqual(previousSave.fileMetadatas.UUIDToFileMetadata[k], UUIDToFileMetadata[k]), k)
  })

  console.log(
    pagesToRemove.size > 0,
    pagesToUpdate.size > 0,
    modulesToUpdate.size > 0,
    siteSettingsHaveChanged,
    hasFileMetadataChanges)

  return (
    pagesToRemove.size > 0 ||
    pagesToUpdate.size > 0 ||
    modulesToUpdate.size > 0 ||
    siteSettingsHaveChanged ||
    hasFileMetadataChanges
  );
}
