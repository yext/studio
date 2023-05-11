import { ComponentMetadata } from "./ComponentMetadata";
import { ErrorFileMetadata } from "./ErrorFileMetadata";
import { ModuleMetadata } from "./ModuleMetadata";

export enum FileMetadataKind {
  Component = "componentMetadata",
  Module = "moduleMetadata",
  Error = "errorMetadata",
}

export type FileMetadata =
  | ComponentMetadata
  | ModuleMetadata
  | ErrorFileMetadata;

export type ValidFileMetadata = Exclude<FileMetadata, ErrorFileMetadata>;
