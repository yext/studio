import initialStudioData from "virtual_yext-studio";
import PreviousSaveSlice, {
  PreviousSaveSliceState,
} from "../models/slices/PreviousSaveSlice";
import { SliceCreator } from "../models/utils";

const createPreviousSaveSlice: SliceCreator<PreviousSaveSlice> = (set) => ({
  siteSettings: {
    values: initialStudioData.siteSettings?.values,
  },
  setPreviousSave(saveState: PreviousSaveSliceState) {
    set(saveState);
  },
});

export default createPreviousSaveSlice;
