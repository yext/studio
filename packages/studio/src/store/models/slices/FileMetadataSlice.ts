import {
  ComponentMetadata,
  ComponentState,
  FileMetadata,
  ModuleMetadata,
  PropValues,
} from "@yext/studio-plugin";
import { ImportType } from "../ImportType";

export interface FileMetadataSliceStates {
  /** Metadata of all components and modules that can be used in Studio. */
  UUIDToFileMetadata: Record<string, FileMetadata>;
  /** Component's metadata uuid and its functional component method. */
  UUIDToImportedComponent: Record<string, ImportType>;
}

export interface FileMetadataSliceActions {
  setFileMetadata: (metadataUUID: string, fileMetadata: FileMetadata) => void;
  getFileMetadata: (metadataUUID: string) => FileMetadata;
  getModuleMetadata: (metadataUUID: string) => ModuleMetadata;
  removeFileMetadata: (metadataUUID: string) => void;
  getComponentMetadata: (metadataUUID: string) => ComponentMetadata;
  setUUIDToImportedComponent: (
    importedComponents: Record<string, ImportType>
  ) => void;
  setComponentTreeInModule: (
    metadataUUID: string,
    componentTree: ComponentState[]
  ) => void;
  updateComponentPropsInsideModule: (
    metadataUUID: string,
    componentUUID: string,
    props: PropValues
  ) => void;
  setListExpressionInModule: (
    metadataUUID: string,
    componentUUID: string,
    listExpression: string
  ) => void;
  getComponentStateInsideModule: (
    metadataUUID: string,
    componentUUID: string
  ) => ComponentState;
}

/**
 * Maintains metadata for Component and Module, available for users
 * to import and preview in Studio.
 */
type FileMetadataSlice = FileMetadataSliceStates & FileMetadataSliceActions;
export default FileMetadataSlice;
