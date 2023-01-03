import { StudioStore } from "./models/store";

/**
 * Gets the part of the Studio store that a user can directly update through
 * the UI. In other words, it leaves out the parts of state that are only
 * indirectly modified by Studio components (i.e. the mapping of imported
 * components).
 */
export function getUserUpdatableStore(store: StudioStore) {
  const { UUIDToImportedComponent: _, ...remainingFileMetadata } =
    store.fileMetadatas;
  return {
    ...store,
    fileMetadatas: {
      ...remainingFileMetadata,
    },
  };
}
