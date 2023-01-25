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
  pendingChanges: {
    /**
     * The UUID of modules (new or existing) that need to be updated in the
     * user's file system.
     */
    modulesToUpdate: Set<string>;
  };
}

export interface FileMetadataSliceActions {
  setFileMetadata: (uuid: string, fileMetadata: FileMetadata) => void;
  getFileMetadata: (uuid: string) => FileMetadata;
  getModuleMetadata: (uuid: string) => ModuleMetadata;
  removeFileMetadata: (uuid: string) => void;
  getComponentMetadata: (uuid: string) => ComponentMetadata;
  setUUIDToImportedComponent: (
    importedComponents: Record<string, ImportType>
  ) => void;
  setComponentTreeInModule: (metadataUUID: string, componentTree: ComponentState[]) => void;
  updateComponentPropsInsideModule: (metadataUUID: string, componentUUID: string, props: PropValues) => void;
  getComponentStateInsideModule: (metadataUUID: string, componentUUID: string) => ComponentState;
  addComponentToModule: (metadataUUID: string, componentState: ComponentState) => void;
  removeComponentFromModule: (metadataUUID: string, componentUUID: string) => void;
}

/**
 * Maintains metadata for Component and Module, available for users
 * to import and preview in Studio.
 */
type FileMetadataSlice = FileMetadataSliceStates & FileMetadataSliceActions;
export default FileMetadataSlice;
