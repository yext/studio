import initialStudioData from "virtual_yext-studio";
import { LayoutsSlice } from "../models/slices/LayoutsSlice";
import { SliceCreator } from "../models/utils";

const createLayoutsSlice: SliceCreator<LayoutsSlice> = () => ({
  layouts: initialStudioData.layoutNameToLayoutPath
});

export default createLayoutsSlice;