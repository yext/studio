import { ComponentState, PropValues } from "@yext/studio-plugin";
import FileMetadataSlice from "./slices/FileMetadataSlice";
import PageSlice from "./slices/PageSlice";
import PreviousCommitSlice from "./slices/PreviousCommitSlice";
import SiteSettingSlice from "./slices/SiteSettingsSlice";

/**
 * The overall shape of the Zustand store as the state manager for Studio.
 * It's comprised of three slices, each of which is responsible for
 * handling actions and updating specific isolated set of data.
 */
export type StudioStore = {
  fileMetadatas: FileMetadataSlice;
  pages: PageSlice;
  siteSettings: SiteSettingSlice;
  previousCommit: PreviousCommitSlice;
  commitChanges: () => void;
  createModule: (filepath: string) => boolean;
  addComponent: (componentState: ComponentState) => void;
  removeComponent: (componentUUID: string) => void;
} & ActiveComponentActions;

export type ActiveComponentActions = {
  updateActiveComponentProps: (props: PropValues) => void;
  getActiveComponentState: () => ComponentState | undefined;
  updateComponentTree: (componentTree: ComponentState[]) => void;
  getComponentTree: () => ComponentState[] | undefined;
};
