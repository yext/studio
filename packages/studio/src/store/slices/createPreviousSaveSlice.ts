import initialStudioData from "virtual:yext-studio";
import PreviousSaveSlice from "../models/slices/PreviousSaveSlice";
import { SliceCreator } from "../models/utils";

const createPreviousSaveSlice: SliceCreator<PreviousSaveSlice> = () => ({
  siteSettings: {
    values: initialStudioData.siteSettings?.values,
  },
  fileMetadatas: {
    UUIDToFileMetadata: initialStudioData.UUIDToFileMetadata,
  },
});

export default createPreviousSaveSlice;
