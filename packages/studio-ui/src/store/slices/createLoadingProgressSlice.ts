import LoadingProgressSlice from "../models/slices/LoadingProgressSlice";
import { SliceCreator } from "../models/utils";

const createLoadingProgressSlice: SliceCreator<LoadingProgressSlice> = (
  set
) => ({
  loadedStyles: new Set<string>(),
  addLoadedStyle: (style: string) => {
    set((store) => {
      store.loadedStyles.add(style);
    });
  },
});

export default createLoadingProgressSlice;
