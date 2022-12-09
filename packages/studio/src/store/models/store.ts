import { FileMetadatasSlice } from "./slices/fileMetadatas";
import { PagesSlice } from "./slices/pages";
import { SiteSettingsSlice } from "./slices/siteSettings";

/**
 * The overall shape of the Zustand store as the state manager for Studio.
 * It's comprised of three slices, each of which is responsible for
 * handling actions and updating specific isolated set of data.
 */
export interface StudioStore {
  fileMetadatas: FileMetadatasSlice;
  pages: PagesSlice;
  siteSettings: SiteSettingsSlice;
}
