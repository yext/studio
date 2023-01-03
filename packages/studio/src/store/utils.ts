import { StudioStore } from "./models/store";

export function getStoreWithoutImportedComponents(store: StudioStore) {
  const { UUIDToImportedComponent: _, ...remainingFileMetadata } =
    store.fileMetadatas;
  return {
    ...store,
    fileMetadatas: {
      ...remainingFileMetadata,
    },
  };
}
