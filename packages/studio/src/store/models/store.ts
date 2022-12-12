import { FileMetadataSlice } from "./slices/fileMetadataSlice";
import { PageSlice } from "./slices/pageSlice";
import { SiteSettingSlice } from "./slices/siteSettingSlice";

/**
 * The overall shape of the Zustand store as the state manager for Studio.
 * It's comprised of three slices, each of which is responsible for
 * handling actions and updating specific isolated set of data.
 */
export interface StudioStore {
  fileMetadatas: FileMetadataSlice;
  pages: PageSlice;
  siteSettings: SiteSettingSlice;
}
