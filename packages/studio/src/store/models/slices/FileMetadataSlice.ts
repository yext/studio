import {
  ComponentMetadata,
  ComponentState,
  FileMetadata,
  ModuleMetadata,
  ValidFileMetadata,
} from "@yext/studio-plugin";
import { ImportType } from "../ImportType";

export interface FileMetadataSliceStates {
  /** Metadata of all components and modules that can be used in Studio. */
  UUIDToFileMetadata: Record<string, FileMetadata>;
  /** Component's metadata uuid and its functional component method. */
  UUIDToImportedComponent: Record<string, ImportType>;
}

export interface FileMetadataSliceActions {
  setFileMetadata: (
    metadataUUID: string,
    fileMetadata: ValidFileMetadata
  ) => void;
  getFileMetadata: (metadataUUID: string) => FileMetadata | undefined;
  getModuleMetadata: (metadataUUID: string) => ModuleMetadata;
  removeFileMetadata: (metadataUUID: string) => void;
  getComponentMetadata: (metadataUUID: string) => ComponentMetadata;
  setImportedComponent: (uuid: string, importedComponent: ImportType) => void;
  setComponentTreeInModule: (
    metadataUUID: string,
    componentTree: ComponentState[]
  ) => void;
}

/**
 * Maintains metadata for Component and Module, available for users
 * to import and preview in Studio.
 */
type FileMetadataSlice = FileMetadataSliceStates & FileMetadataSliceActions;
export default FileMetadataSlice;
