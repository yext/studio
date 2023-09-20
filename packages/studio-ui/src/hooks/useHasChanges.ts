import useStudioStore from "../store/useStudioStore";
import isEqual from "lodash/isEqual";

export default function useHasChanges() {
  // TODO(SLAP-2556) Refactor pendingChanges to use PreviousSaveSlice
  const [pagesToRemove, pagesToUpdate] = useStudioStore((store) => [
    store.pages.pendingChanges.pagesToRemove,
    store.pages.pendingChanges.pagesToUpdate,
  ]);

  const previousSave = useStudioStore((store) => store.previousSave);
  const siteSettingsValues = useStudioStore(
    (store) => store.siteSettings.values
  );

  const siteSettingsHaveChanged = !isEqual(
    previousSave.siteSettings.values,
    siteSettingsValues
  );

  return (
    pagesToRemove.size > 0 || pagesToUpdate.size > 0 || siteSettingsHaveChanged
  );
}
