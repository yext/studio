import initialStudioData from "virtual_yext-studio";
import { LayoutSlice } from "../models/slices/LayoutSlice";
import { SliceCreator } from "../models/utils";
import removeTopLevelFragments from "../../utils/removeTopLevelFragments";

const createLayoutSlice: SliceCreator<LayoutSlice> = () => ({
  layouts: removeTopLevelFragments(initialStudioData.layoutNameToLayoutState),
});

export default createLayoutSlice;
