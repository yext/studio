import { FileMetadata } from "@yext/studio-plugin";

export interface FileMetadataSliceStates {
  /** Metadata of all components and modules the can be use in Studio. */
  UUIDToFileMetadata: Record<string, FileMetadata>;
}

export interface FileMetadataSliceActions {
  setFileMetadata: (uuid: string, fileMetadata: FileMetadata) => void;
  getFileMetadata: (uuid: string) => FileMetadata;
  removeFileMetadata: (uuid: string) => void;
}

/**
 * Maintains metadata for Component and Module, available for users
 * to import and preview in Studio.
 */
export type FileMetadataSlice = FileMetadataSliceStates & FileMetadataSliceActions;
