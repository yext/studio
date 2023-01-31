import useStudioStore from "../store/useStudioStore";
import { isEqual } from "lodash";

/**
 * Renders a button for committing changes to user's files.
 */
export default function CommitChangesButton() {
  const hasChanges = useHasChanges();
  const commitChangesAction = useStudioStore((store) => store.commitChanges);

  return (
    <button
      className="ml-4 py-1 px-3 text-white rounded-md disabled:bg-gray-400 bg-blue-600"
      onClick={commitChangesAction}
      disabled={!hasChanges}
      aria-label="Commit Changes to Repository"
    >
      Save
    </button>
  );
}

function useHasChanges() {
  // TODO(SLAP-2556) Refactor pendingChanges to use PreviousCommitSlice
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
  const previousCommit = useStudioStore((store) => store.previousCommit);
  const siteSettingsValues = useStudioStore(
    (store) => store.siteSettings.values
  );

  const siteSettingsHaveChanged = !isEqual(
    previousCommit.siteSettings.values,
    siteSettingsValues
  );
  const hasFileMetadataChanges = !isEqual(
    previousCommit.fileMetadatas.UUIDToFileMetadata,
    UUIDToFileMetadata
  );

  return (
    pagesToRemove.size > 0 ||
    pagesToUpdate.size > 0 ||
    modulesToUpdate.size > 0 ||
    siteSettingsHaveChanged ||
    hasFileMetadataChanges
  );
}
