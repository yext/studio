import LoadedStylesSlice from "../models/slices/LoadedStylesSlice";
import { SliceCreator } from "../models/utils";

const createLoadedStylesSlice: SliceCreator<LoadedStylesSlice> = (set) => ({
  loadedStyleFilepaths: new Set<string>(),
  addLoadedStyleFilepath: (styleFilepath: string) => {
    set((store) => {
      store.loadedStyleFilepaths.add(styleFilepath);
    });
  },
});

export default createLoadedStylesSlice;
