import { FileMetadata } from "@yext/studio-plugin";

export interface FileMetadatasStates {
  /** Metadata of all components and modules the can be use in Studio. */
  UUIDToFileMetadata: Record<string, FileMetadata>;
}

export interface FileMetadatasActions {
  setFileMetadata: (uuid: string, fileMetadata: FileMetadata) => void;
  getFileMetadata: (uuid: string) => FileMetadata;
  removeFileMetadata: (uuid: string) => void;
}

/**
 * Maintains metadata for Component and Module, available for users
 * to import and preview in Studio.
 */
export type FileMetadatasSlice = FileMetadatasStates & FileMetadatasActions;
