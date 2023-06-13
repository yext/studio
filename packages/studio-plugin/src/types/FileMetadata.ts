import { ComponentMetadata } from "./ComponentMetadata.js";
import { ErrorFileMetadata } from "./ErrorFileMetadata.js";
import { ModuleMetadata } from "./ModuleMetadata.js";

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
