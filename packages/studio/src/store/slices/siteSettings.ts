import { SiteSettingsSlice } from "../models/slices/siteSettings";
import { SliceCreator } from "../models/utils";

export const createSiteSettingsSlice: SliceCreator<SiteSettingsSlice> = (
  set
) => ({
  metadata: undefined,
  state: undefined,
  setMetadata: (metadata) => set({ metadata }),
  setState: (state) => set({ state }),
});
