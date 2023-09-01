
import PreviousSaveSlice, {
  PreviousSaveSliceState,
} from "../models/slices/PreviousSaveSlice";
import { SliceCreator } from "../models/utils";

const createPreviousSaveSlice: SliceCreator<PreviousSaveSlice> = (set) => ({
  siteSettings: {},
  fileMetadatas: {
    UUIDToFileMetadata: {},
  },
  setPreviousSave(saveState: PreviousSaveSliceState) {
    set(saveState);
  },
});

export default createPreviousSaveSlice;
