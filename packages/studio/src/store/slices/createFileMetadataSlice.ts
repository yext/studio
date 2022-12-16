import { FileMetadata, FileMetadataKind } from "@yext/studio-plugin";
import initialStudioData from "virtual:yext-studio";
import FileMetadataSlice from "../models/slices/FileMetadataSlice";
import { SliceCreator } from "../models/utils";

const createFileMetadataSlice: SliceCreator<FileMetadataSlice> = (
  set,
  get
) => ({
  UUIDToFileMetadata: initialStudioData.UUIDToFileMetadata,
  setFileMetadata: (uuid: string, metadata: FileMetadata) =>
    set((store) => {
      store.UUIDToFileMetadata[uuid] = metadata;
    }),
  getFileMetadata: (uuid: string) => get().UUIDToFileMetadata[uuid],
  //TODO: add logic here to ensure this component is made by admin and can be deleted.
  removeFileMetadata: (uuid: string) =>
    set((store) => {
      delete store.UUIDToFileMetadata[uuid];
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
});

export default createFileMetadataSlice;
