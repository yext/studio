import StudioActions from "../StudioActions";
import FileMetadataSlice from "./slices/FileMetadataSlice";
import PageSlice from "./slices/PageSlice";
import PreviousSaveSlice from "./slices/PreviousSaveSlice";
import SiteSettingSlice from "./slices/SiteSettingsSlice";
import StudioConfigSlice from "./slices/StudioConfigSlice";

/**
 * The overall shape of the Zustand store as the state manager for Studio.
 * It's comprised of three slices, each of which is responsible for
 * handling actions and updating specific isolated set of data.
 */
export type StudioStore = {
  fileMetadatas: FileMetadataSlice;
  pages: PageSlice;
  siteSettings: SiteSettingSlice;
  previousSave: PreviousSaveSlice;
  createModule: (modulePath: string) => void;
  actions: StudioActions;
  studioConfig: StudioConfigSlice;
};
