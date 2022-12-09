import { PropShape, PropValues } from "@yext/studio-plugin";

interface SiteSettingsMetadata {
  propShape: PropShape;
}

export interface SiteSettingsStates {
  /** Metadata outlining site settings' interface properties */
  metadata?: SiteSettingsMetadata;
  /** Site setting's actual field values */
  state?: PropValues;
}

export interface SiteSettingsActions {
  setMetadata: (metadata: SiteSettingsMetadata) => void;
  setState: (state: PropValues) => void;
}

/**
 * Maintains the site settings that apply to all pages.
 */
export type SiteSettingsSlice = SiteSettingsStates & SiteSettingsActions;
