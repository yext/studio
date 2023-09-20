import SiteSettingSlice from "./SiteSettingsSlice";

/**
 * Keeps track of the state of the application at the time of the last save.
 */
export interface PreviousSaveSliceState {
  siteSettings: Pick<SiteSettingSlice, "values">;
}

export interface PreviousSaveSliceActions {
  setPreviousSave: (saveState: PreviousSaveSliceState) => void;
}

type PreviousSaveSlice = PreviousSaveSliceState & PreviousSaveSliceActions;
export default PreviousSaveSlice;
