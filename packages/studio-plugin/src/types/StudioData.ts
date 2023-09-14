import { FileMetadata } from "./FileMetadata";
import { SiteSettings } from "./SiteSettings";
import { ErrorPageState, PageState } from "./PageState";
import { StudioConfigWithDefaulting } from "./StudioConfig";
import { LayoutState } from "./LayoutState";

export interface StudioData {
  pageNameToPageState: Record<string, PageState>;
  pageNameToErrorPageState: Record<string, ErrorPageState>;
  UUIDToFileMetadata: Record<string, FileMetadata>;
  layoutNameToLayoutState: Record<string, LayoutState>;
  siteSettings?: SiteSettings;
  studioConfig: StudioConfigWithDefaulting;
  isWithinCBD: boolean;
}
