import LoadedStylesSlice from "../models/slices/LoadedStylesSlice";
import { SliceCreator } from "../models/utils";

const createLoadedStylesSlice: SliceCreator<LoadedStylesSlice> = (set) => ({
  loadedStyles: new Set<string>(),
  addLoadedStyle: (style: string) => {
    set((store) => {
      store.loadedStyles.add(style);
    });
  },
});

export default createLoadedStylesSlice;
