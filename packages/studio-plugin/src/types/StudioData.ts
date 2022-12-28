import { SiteSettings } from "../sourcefiles/SiteSettingsFile";
import { ComponentMetadata } from "./ComponentMetadata";
import { PageState } from "./State";
import { StudioPaths } from "./StudioPaths";

export interface StudioData {
  pageNameToPageState: Record<string, PageState>;
  UUIDToFileMetadata: Record<string, ComponentMetadata>;
  siteSettings?: SiteSettings;
  studioPaths: StudioPaths;
}
