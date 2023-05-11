import { FileMetadata } from "./FileMetadata";
import { SiteSettings } from "./SiteSettings";
import { ErrorPageState, PageState } from "./PageState";
import { RequiredStudioConfig } from "../parsers/getStudioConfig";

export interface StudioData {
  pageNameToPageState: Record<string, PageState>;
  pageNameToErrorPageState: Record<string, ErrorPageState>;
  UUIDToFileMetadata: Record<string, FileMetadata>;
  siteSettings?: SiteSettings;
  studioConfig: RequiredStudioConfig;
}
