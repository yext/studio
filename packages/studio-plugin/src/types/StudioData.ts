import { FileMetadata } from "./FileMetadata";
import { SiteSettings } from "./SiteSettings";
import { ErrorPageState, PageState } from "./PageState";
import { StudioConfigWithDefaulting } from "./StudioConfig";

export interface StudioData {
  pageNameToPageState: Record<string, PageState>;
  pageNameToErrorPageState: Record<string, ErrorPageState>;
  UUIDToFileMetadata: Record<string, FileMetadata>;
  siteSettings?: SiteSettings;
  studioConfig: StudioConfigWithDefaulting;
}
