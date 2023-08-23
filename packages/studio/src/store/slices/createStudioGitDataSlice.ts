import StudioGitDataSlice from "../models/slices/StudioGitDataSlice";
import { SliceCreator } from "../models/utils";
import StudioGitData from "virtual_yext-studio-git-data";

const createStudioGitDataSlice: SliceCreator<StudioGitDataSlice> = () => ({
  isWithinCBD: StudioGitData.isWithinCBD
});

export default createStudioGitDataSlice;
