import { FileMetadata } from "./FileMetadata";
import { SiteSettings } from "./SiteSettings";
import { ErrorPageState, PageState } from "./PageState";
import { StudioConfigWithDefaulting } from "./StudioConfig";
import { LayoutMetadata } from "./LayoutMetadata";

export interface StudioData {
  pageNameToPageState: Record<string, PageState>;
  pageNameToErrorPageState: Record<string, ErrorPageState>;
  UUIDToFileMetadata: Record<string, FileMetadata>;
  layoutNameToLayoutMetadata: Record<string, LayoutMetadata>;
  siteSettings?: SiteSettings;
  studioConfig: StudioConfigWithDefaulting;
  isWithinCBD: boolean;
}
