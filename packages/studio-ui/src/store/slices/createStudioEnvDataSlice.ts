import StudioEnvDataSlice from "../models/slices/StudioEnvDataSlice";
import { SliceCreator } from "../models/utils";

const createStudioEnvDataSlice: SliceCreator<StudioEnvDataSlice> = () => ({
  isWithinCBD: false
});

export default createStudioEnvDataSlice;
