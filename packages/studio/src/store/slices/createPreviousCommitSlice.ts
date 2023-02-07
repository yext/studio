import PreviousCommitSlice from "../models/slices/PreviousCommitSlice";
import { SliceCreator } from "../models/utils";

const createPreviousCommitSlice: SliceCreator<PreviousCommitSlice> = () => ({
  siteSettings: {
    values: undefined,
  },
  fileMetadatas: {
    UUIDToFileMetadata: {},
  },
});

export default createPreviousCommitSlice;
