import StudioConfigSlice from "../models/slices/StudioConfigSlice";
import { SliceCreator } from "../models/utils";
import initialStudioData from "virtual:yext-studio";

const createStudioConfigSlice: SliceCreator<StudioConfigSlice> = () => ({
  paths: initialStudioData.studioConfig?.paths,
  isPagesJSRepo: initialStudioData.studioConfig?.isPagesJSRepo,
});

export default createStudioConfigSlice;
