import { SliceCreator } from "../models/utils";
import PagePreviewSlice from "../models/slices/PagePreviewSlice";

const createPagePreviewSlice: SliceCreator<PagePreviewSlice> = (set) => ({
  viewport: {
    name: "Reset Viewport",
    styles: {
      height: window.innerHeight,
      width: window.innerWidth,
    },
    type: "other",
    css: "h-full w-full",
  },
  setViewport: (viewport) => set({ viewport }),
});

export default createPagePreviewSlice;
