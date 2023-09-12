import StudioActions from "../StudioActions";
import FileMetadataSlice from "./slices/FileMetadataSlice";
import { LayoutSlice } from "./slices/LayoutSlice";
import PagePreviewSlice from "./slices/PagePreviewSlice";
import PageSlice from "./slices/PageSlice";
import PreviousSaveSlice from "./slices/PreviousSaveSlice";
import SiteSettingSlice from "./slices/SiteSettingsSlice";
import StudioConfigSlice from "./slices/StudioConfigSlice";
import StudioEnvDataSlice from "./slices/StudioEnvDataSlice";

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
  createModule: (modulePath: string) => void;
  actions: StudioActions;
  studioConfig: StudioConfigSlice;
  studioEnvData: StudioEnvDataSlice;
};
