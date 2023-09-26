import GitDataSlice from "../models/slices/GitDataSlice";
import { SliceCreator } from "../models/utils";
import initialGitData from "virtual_yext-studio-git-data";

const createGitDataSlice: SliceCreator<GitDataSlice> = () => ({
  canPush: initialGitData.canPush,
});

export default createGitDataSlice;
