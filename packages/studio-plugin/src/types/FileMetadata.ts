import { ComponentMetadata } from "./ComponentMetadata";
import { ErrorFileMetadata } from "./ErrorFileMetadata";

export enum FileMetadataKind {
  Component = "componentMetadata",
  Error = "errorMetadata",
}

export type FileMetadata = ComponentMetadata | ErrorFileMetadata;

export type ValidFileMetadata = Exclude<FileMetadata, ErrorFileMetadata>;
