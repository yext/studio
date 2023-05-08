import type { UseStudioStore } from "./useStudioStore";

/**
 * Zustand initial state cannot be setup to wait for async dependencies.
 * Instead, they must be set after the store is instantiated.
 *
 * Therefore in order to set the initial activeEntityData, which requires
 * a dynamic import, we must set it outside of the store on startup.
 */
export default async function setInitialEntityFile(
  useStudioStore: UseStudioStore
): Promise<void> {
  const pageSlice = useStudioStore.getState().pages;
  const activePageState = pageSlice.getActivePageState();
  const firstAcceptedEntityFile = activePageState?.pagesJS?.entityFiles?.[0];
  if (firstAcceptedEntityFile) {
    const localDataFolder =
      useStudioStore.getState().studioConfig.paths.localData;
    await pageSlice.setActiveEntityFile(
      localDataFolder,
      firstAcceptedEntityFile
    );
  }
}
