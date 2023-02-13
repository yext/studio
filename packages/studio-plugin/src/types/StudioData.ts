import { FileMetadata } from "./FileMetadata";
import { SiteSettings } from "./SiteSettings";
import { PageState } from "./PageState";
import { UserPaths } from "./UserPaths";

export interface StudioData {
  pageNameToPageState: Record<string, PageState>;
  UUIDToFileMetadata: Record<string, FileMetadata>;
  siteSettings?: SiteSettings;
  userPaths: UserPaths;
}
