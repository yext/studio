import { FileMetadataKind } from "./FileMetadata";

export type ErrorFileMetadata = {
  kind: FileMetadataKind.Error;
  intendedKind: FileMetadataKind.Component | FileMetadataKind.Module;
  filepath: string;
  metadataUUID: string;
  message: string;
};
