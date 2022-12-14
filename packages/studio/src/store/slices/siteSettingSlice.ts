import { SiteSettingSlice } from "../models/slices/siteSettingSlice";
import { SliceCreator } from "../models/utils";

export const createSiteSettingSlice: SliceCreator<SiteSettingSlice> = (
  set
) => ({
  shape: undefined,
  values: undefined,
  setShape: (shape) => set({ shape }),
  setValues: (values) => set({ values }),
});
