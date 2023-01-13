import { SiteSettingsShape, SiteSettingsValues } from "@yext/studio-plugin";

export interface SiteSettingSliceStates {
  /** Metadata outlining site settings' interface properties. */
  shape?: SiteSettingsShape;
  /** Site setting's actual field values. */
  values?: SiteSettingsValues;
}

export interface SiteSettingSliceActions {
  setShape: (shape: SiteSettingsShape) => void;
  setValues: (state: SiteSettingsValues) => void;
}

/**
 * Maintains the site settings that apply to all pages.
 */
type SiteSettingSlice = SiteSettingSliceStates & SiteSettingSliceActions;
export default SiteSettingSlice;
