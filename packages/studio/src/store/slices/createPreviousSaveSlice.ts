import initialStudioData from "virtual:yext-studio";
import PreviousSaveSlice, {
  PreviousSaveSliceState,
} from "../models/slices/PreviousSaveSlice";
import { SliceCreator } from "../models/utils";

const createPreviousSaveSlice: SliceCreator<PreviousSaveSlice> = (set) => ({
  siteSettings: {
    values: initialStudioData.siteSettings?.values,
  },
  fileMetadatas: {
    UUIDToFileMetadata: initialStudioData.UUIDToFileMetadata,
  },
  setPreviousSave(saveState: PreviousSaveSliceState) {
    set(saveState);
  },
});

export default createPreviousSaveSlice;
