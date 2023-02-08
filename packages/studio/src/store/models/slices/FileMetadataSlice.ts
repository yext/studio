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
  getComponentStateInsideModule: (
    metadataUUID: string,
    componentUUID: string
  ) => ComponentState;
  addComponentToModule: (
    metadataUUID: string,
    componentState: ComponentState,
    activeComponentUUID: string | undefined
  ) => void;
  removeComponentFromModule: (
    metadataUUID: string,
    componentUUID: string
  ) => void;
}

/**
 * Maintains metadata for Component and Module, available for users
 * to import and preview in Studio.
 */
type FileMetadataSlice = FileMetadataSliceStates & FileMetadataSliceActions;
export default FileMetadataSlice;
