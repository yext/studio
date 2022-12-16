import SiteSettingsSlice from "../models/slices/SiteSettingsSlice";
import { SliceCreator } from "../models/utils";

const createSiteSettingsSlice: SliceCreator<SiteSettingsSlice> = (
  set
) => ({
  shape: undefined,
  values: undefined,
  setShape: (shape) => set({ shape }),
  setValues: (values) => set({ values }),
});

export default createSiteSettingsSlice;