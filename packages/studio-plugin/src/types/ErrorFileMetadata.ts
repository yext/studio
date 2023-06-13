import { FileMetadataKind } from "./FileMetadata.js";

export type ErrorFileMetadata = {
  kind: FileMetadataKind.Error;
  filepath: string;
  metadataUUID: string;
  message: string;
};
