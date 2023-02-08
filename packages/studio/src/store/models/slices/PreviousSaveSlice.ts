import FileMetadataSlice from "./FileMetadataSlice";
import SiteSettingSlice from "./SiteSettingsSlice";

/**
 * Keeps track of the state of the application at the time of the last save.
 */
export interface PreviousSaveSlice {
  siteSettings: Pick<SiteSettingSlice, "values">;
  fileMetadatas: Pick<FileMetadataSlice, "UUIDToFileMetadata">;
}

export default PreviousSaveSlice;
