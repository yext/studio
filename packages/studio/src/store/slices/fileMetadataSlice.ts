import { FileMetadata } from "@yext/studio-plugin";
import { FileMetadataSlice } from "../models/slices/fileMetadataSlice";
import { SliceCreator } from "../models/utils";

export const createFileMetadataSlice: SliceCreator<FileMetadataSlice> = (
  set,
  get
) => ({
  UUIDToFileMetadata: {},
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
});
