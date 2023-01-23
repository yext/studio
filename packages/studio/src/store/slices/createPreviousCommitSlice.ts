import initialStudioData from "virtual:yext-studio";
import PreviousCommitSlice from "../models/slices/PreviousCommitSlice";
import { SliceCreator } from "../models/utils";

const createPreviousCommitSlice: SliceCreator<PreviousCommitSlice> = () => ({
  siteSettings: {
    values: initialStudioData.siteSettings?.values,
  }
});

export default createPreviousCommitSlice;
