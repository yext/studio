import type { UseStudioStore } from "./useStudioStore";

/**
 * Zustand initial state cannot be setup to wait for async dependencies.
 * Instead, they must be set after the store is instantiated.
 *
 * Therefore in order to set the initial activePageEntities, which requires
 * dynamic imports, we must set it outside of the store on startup.
 */
export default async function setInitialEntities(
  useStudioStore: UseStudioStore
): Promise<void> {
  const pageSlice = useStudioStore.getState().pages;
  const localDataFolder =
    useStudioStore.getState().studioConfig.paths.localData;
  await pageSlice.updateActivePageEntities(localDataFolder);
}
