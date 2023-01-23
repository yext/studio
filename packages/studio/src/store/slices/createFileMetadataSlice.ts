import { FileMetadata, FileMetadataKind } from "@yext/studio-plugin";
import initialStudioData from "virtual:yext-studio";
import FileMetadataSlice from "../models/slices/FileMetadataSlice";
import { SliceCreator } from "../models/utils";
import { ImportType } from "../models/ImportType";

const createFileMetadataSlice: SliceCreator<FileMetadataSlice> = (
  set,
  get
) => ({
  UUIDToFileMetadata: initialStudioData.UUIDToFileMetadata,
  UUIDToImportedComponent: {},
  pendingChanges: {
    modulesToUpdate: new Set<string>(),
    modulesToRemove: new Set<string>(),
  },
  setFileMetadata: (uuid: string, metadata: FileMetadata) =>
    set((store) => {
      store.UUIDToFileMetadata[uuid] = metadata;
      if (metadata.kind === FileMetadataKind.Module) {
        store.pendingChanges.modulesToUpdate.add(uuid);
      }
    }),
  getFileMetadata: (uuid: string) => get().UUIDToFileMetadata[uuid],
  removeFileMetadata: (uuid: string) =>
    set((store) => {
      const metadata = store.UUIDToFileMetadata[uuid];
      if (metadata.kind === FileMetadataKind.Module) {
        store.pendingChanges.modulesToRemove.add(uuid);
        delete store.UUIDToFileMetadata[uuid];
      } else {
        console.error(
          "removeFileMetadata is only allowed for modules, not:",
          metadata.kind
        );
      }
    }),
  getComponentMetadata: (uuid) => {
    const fileMetadata = get().getFileMetadata(uuid);
    if (fileMetadata.kind !== FileMetadataKind.Component) {
      throw new Error(
        `Expected a ComponentMetadata for uuidFile ${uuid}, instead received ${JSON.stringify(
          fileMetadata,
          null,
          2
        )}.`
      );
    }
    return fileMetadata;
  },
  setUUIDToImportedComponent: (
    importedComponents: Record<string, ImportType>
  ) => set({ UUIDToImportedComponent: importedComponents }),
});

export default createFileMetadataSlice;
