import { FileMetadataKind } from "./FileMetadata";

export type ErrorFileMetadata = {
  kind: FileMetadataKind.Error;
  filepath: string;
  metadataUUID: string;
  message: string;
};
