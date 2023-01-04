import FileMetadataSlice from "./models/slices/FileMetadataSlice";
import { StudioStore } from "./models/store";

type UserUpdatableStore = Omit<StudioStore, "fileMetadatas"> & {
  fileMetadatas: Omit<FileMetadataSlice, "UUIDToImportedComponent">;
};

/**
 * Gets the part of the Studio store that a user can directly update through
 * the UI. In other words, it leaves out the parts of state that are only
 * indirectly modified by Studio components (i.e. the mapping of imported
 * components).
 */
export function getUserUpdatableStore(store: StudioStore): UserUpdatableStore {
  const { UUIDToImportedComponent: _, ...remainingFileMetadata } =
    store.fileMetadatas;
  return {
    ...store,
    fileMetadatas: {
      ...remainingFileMetadata,
    },
  };
}
