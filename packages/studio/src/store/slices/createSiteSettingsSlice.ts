import initialStudioData from "virtual:yext-studio";
import SiteSettingsSlice from "../models/slices/SiteSettingsSlice";
import { SliceCreator } from "../models/utils";

const createSiteSettingsSlice: SliceCreator<SiteSettingsSlice> = (set) => ({
  shape: initialStudioData.siteSettings?.shape,
  values: initialStudioData.siteSettings?.values,
  setShape: (shape) => set({ shape }),
  setValues: (values) => set({ values }),
});

export default createSiteSettingsSlice;
