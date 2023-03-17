import { FileMetadata } from "./FileMetadata";
import { SiteSettings } from "./SiteSettings";
import { PageState } from "./PageState";
import { RequiredStudioConfig } from "../parsers/getStudioConfig";

export interface StudioData {
  pageNameToPageState: Record<string, PageState>;
  UUIDToFileMetadata: Record<string, FileMetadata>;
  siteSettings?: SiteSettings;
  studioConfig: RequiredStudioConfig;
}
