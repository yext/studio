import { FileMetadata } from "./FileMetadata.js";
import { SiteSettings } from "./SiteSettings.js";
import { ErrorPageState, PageState } from "./PageState.js";
import { StudioConfigWithDefaulting } from "./StudioConfig.js";

export interface StudioData {
  pageNameToPageState: Record<string, PageState>;
  pageNameToErrorPageState: Record<string, ErrorPageState>;
  UUIDToFileMetadata: Record<string, FileMetadata>;
  siteSettings?: SiteSettings;
  studioConfig: StudioConfigWithDefaulting;
}
