import EnvDataSlice from "../models/slices/EnvDataSlice";
import { SliceCreator } from "../models/utils";
import initialStudioData from "virtual_yext-studio";

const createStudioEnvDataSlice: SliceCreator<EnvDataSlice> = () => ({
  isWithinCBD: initialStudioData.isWithinCBD,
});

export default createStudioEnvDataSlice;
