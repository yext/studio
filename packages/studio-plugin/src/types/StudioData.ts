import { SiteSettings } from "../sourcefiles/SiteSettingsFile";
import { FileMetadata } from "./FileMetadata";
import { PageState } from "./State";
import { UserPaths } from "./UserPaths";

export interface StudioData {
  pageNameToPageState: Record<string, PageState>;
  UUIDToFileMetadata: Record<string, FileMetadata>;
  siteSettings?: SiteSettings;
  userPaths: UserPaths;
}
