import initialStudioData from "virtual_yext-studio";
import { LayoutSlice } from "../models/slices/LayoutSlice";
import { SliceCreator } from "../models/utils";

const createLayoutSlice: SliceCreator<LayoutSlice> = () => ({
  // TODO (SLAP-2930): Remove top-level fragments from layouts
  layouts: initialStudioData.layoutNameToLayoutState,
});

export default createLayoutSlice;
