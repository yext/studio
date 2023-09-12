import initialStudioData from "virtual_yext-studio";
import { LayoutSlice } from "../models/slices/LayoutSlice";
import { SliceCreator } from "../models/utils";

const createLayoutSlice: SliceCreator<LayoutSlice> = () => ({
  layouts: initialStudioData.layoutNameToLayoutMetadata,
});

export default createLayoutSlice;
