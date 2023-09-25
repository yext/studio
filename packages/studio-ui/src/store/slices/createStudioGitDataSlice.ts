import StudioGitDataSlice from "../models/slices/StudioGitDataSlice";
import { SliceCreator } from "../models/utils";
import initialGitData from "virtual_yext-studio-git-data";

const createStudioEnvDataSlice: SliceCreator<StudioGitDataSlice> = () => ({
  canPush: initialGitData.canPush,
});

export default createStudioEnvDataSlice;
