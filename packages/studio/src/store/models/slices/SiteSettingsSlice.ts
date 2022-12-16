import { PropShape, PropValues } from "@yext/studio-plugin";

export interface SiteSettingSliceStates {
  /** Metadata outlining site settings' interface properties. */
  shape?: PropShape;
  /** Site setting's actual field values. */
  values?: PropValues;
}

export interface SiteSettingSliceActions {
  setShape: (shape: PropShape) => void;
  setValues: (state: PropValues) => void;
}

/**
 * Maintains the site settings that apply to all pages.
 */
type SiteSettingSlice = SiteSettingSliceStates & SiteSettingSliceActions;
export default SiteSettingSlice;
