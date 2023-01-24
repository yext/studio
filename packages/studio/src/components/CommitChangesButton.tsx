import { useCallback, useEffect, useMemo, useState } from "react";
import useStudioStore from "../store/useStudioStore";
import classNames from "classnames";
import { isEqual } from "lodash";

/**
 * Renders a button for committing changes to user's files.
 */
export default function CommitChangesButton() {
  const { pagesToRemove, pagesToUpdate } = useStudioStore(
    (store) => store.pages.pendingChanges
  );
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
  const commitChangesAction = useStudioStore((store) => store.commitChanges);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);

  const siteSettingsHaveChanged = !isEqual(
    previousCommit.siteSettings.values,
    siteSettingsValues
  );
  const hasFileMetadataChanges = !isEqual(
    previousCommit.fileMetadatas.UUIDToFileMetadata,
    UUIDToFileMetadata
  );
  const hasPendingChanges =
    pagesToRemove.size > 0 ||
    pagesToUpdate.size > 0 ||
    modulesToUpdate.size > 0 ||
    siteSettingsHaveChanged ||
    hasFileMetadataChanges;

  useEffect(() => {
    setIsButtonDisabled(!hasPendingChanges);
  }, [hasPendingChanges]);

  const handleClickSave = useCallback(() => {
    commitChangesAction();
    setIsButtonDisabled(true);
  }, [commitChangesAction]);

  const buttonClasses = useMemo(
    () =>
      classNames("ml-4 py-1 px-3 text-white rounded-md", {
        "bg-gray-400": isButtonDisabled,
        "bg-blue-600": !isButtonDisabled,
      }),
    [isButtonDisabled]
  );

  return (
    <button
      className={buttonClasses}
      onClick={handleClickSave}
      disabled={isButtonDisabled}
    >
      Save
    </button>
  );
}
