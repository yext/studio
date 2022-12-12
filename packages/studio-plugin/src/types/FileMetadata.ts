import { ComponentMetadata } from "./ComponentMetadata";
import { ModuleMetadata } from "./ModuleMetadata";

export enum FileMetadataKind {
  Component = "componentMetadata",
  Module = "moduleMetadata",
}

export type FileMetadata = ComponentMetadata | ModuleMetadata;
