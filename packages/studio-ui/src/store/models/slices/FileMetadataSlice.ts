import { ComponentMetadata, FileMetadata } from "@yext/studio-plugin";
import { ImportType } from "../ImportType";

export interface FileMetadataSliceStates {
  /** Metadata of all components that can be used in Studio. */
  UUIDToFileMetadata: Record<string, FileMetadata>;
  /** Component's metadata uuid and its functional component method. */
  UUIDToImportedComponent: Record<string, ImportType>;
}

export interface FileMetadataSliceActions {
  getFileMetadata: (metadataUUID: string) => FileMetadata | undefined;
  getComponentMetadata: (metadataUUID: string) => ComponentMetadata;
  setImportedComponent: (uuid: string, importedComponent: ImportType) => void;
}

/**
 * Maintains metadata for Components available for users
 * to import and preview in Studio.
 */
type FileMetadataSlice = FileMetadataSliceStates & FileMetadataSliceActions;
export default FileMetadataSlice;
