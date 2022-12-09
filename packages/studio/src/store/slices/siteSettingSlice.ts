import { SiteSettingSlice } from "../models/slices/siteSettingSlice";
import { SliceCreator } from "../models/utils";

export const createSiteSettingSlice: SliceCreator<SiteSettingSlice> = (
  set
) => ({
  metadata: undefined,
  state: undefined,
  setMetadata: (metadata) => set({ metadata }),
  setState: (state) => set({ state }),
});
