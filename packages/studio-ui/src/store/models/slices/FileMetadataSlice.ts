import { ComponentMetadata, FileMetadata } from "@yext/studio-plugin";
import { ImportType } from "../ImportType";

export interface FileMetadataSliceStates {
  /** Metadata of all components that can be used in Studio. */
  UUIDToFileMetadata: Record<string, FileMetadata>;
  /** Component's metadata uuid and its functional component method. */
  UUIDToImportedComponent: Record<string, ImportType>;
  /** CSS/SCSS imported from each Component */
  filepathToCssFiles: Record<string, Set<string>>;
}

export interface FileMetadataSliceActions {
  getFileMetadata: (metadataUUID: string) => FileMetadata | undefined;
  getComponentMetadata: (metadataUUID: string) => ComponentMetadata;
  setImportedComponent: (uuid: string, importedComponent: ImportType) => void;
  updateFilepathToCssFiles(FilepathToCssFiles: Record<string, string[]>);
}

/**
 * Maintains metadata for Components available for users
 * to import and preview in Studio.
 */
type FileMetadataSlice = FileMetadataSliceStates & FileMetadataSliceActions;
export default FileMetadataSlice;
