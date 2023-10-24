import StudioActions from "../StudioActions";
import AccountContentSlice from "./slices/AccountContentSlice";
import FileMetadataSlice from "./slices/FileMetadataSlice";
import { LayoutSlice } from "./slices/LayoutSlice";
import PagePreviewSlice from "./slices/PagePreviewSlice";
import PageSlice from "./slices/PageSlice";
import PreviousSaveSlice from "./slices/PreviousSaveSlice";
import SiteSettingSlice from "./slices/SiteSettingsSlice";
import StudioConfigSlice from "./slices/StudioConfigSlice";
import EnvDataSlice from "./slices/EnvDataSlice";
import GitDataSlice from "./slices/GitDataSlice";
import LoadingProgressSlice from "./slices/LoadingProgressSlice";

/**
 * The overall shape of the Zustand store as the state manager for Studio.
 * It's comprised of three slices, each of which is responsible for
 * handling actions and updating specific isolated set of data.
 */
export type StudioStore = {
  fileMetadatas: FileMetadataSlice;
  pages: PageSlice;
  layouts: LayoutSlice;
  siteSettings: SiteSettingSlice;
  pagePreview: PagePreviewSlice;
  previousSave: PreviousSaveSlice;
  actions: StudioActions;
  studioConfig: StudioConfigSlice;
  envData: EnvDataSlice;
  gitData: GitDataSlice;
  accountContent: AccountContentSlice;
  loadingProgress: LoadingProgressSlice;
};
