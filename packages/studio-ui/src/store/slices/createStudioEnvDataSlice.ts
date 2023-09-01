import StudioEnvDataSlice from "../models/slices/StudioEnvDataSlice";
import { SliceCreator } from "../models/utils";
import initialStudioData from "virtual_yext-studio";

console.log({ initialStudioData })

const createStudioEnvDataSlice: SliceCreator<StudioEnvDataSlice> = () => ({
  isWithinCBD: initialStudioData.isWithinCBD,
});

export default createStudioEnvDataSlice;
