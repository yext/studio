import { SliceCreator } from "../models/utils";
import PagePreviewSlice from "../models/slices/PagePreviewSlice";

const createPagePreviewSlice: SliceCreator<PagePreviewSlice> = (set) => ({
  viewportDimensions: {
    name: "Reset Viewport",
    height: window.innerHeight,
    width: window.innerWidth,
  },
  setViewportDimensions: (viewportDimensions) => set({ viewportDimensions }),
});

export default createPagePreviewSlice;
