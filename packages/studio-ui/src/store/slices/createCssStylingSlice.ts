import CssSlice from "../models/slices/CssSlice";
import { SliceCreator } from "../models/utils";

const createAccountContentSlice: SliceCreator<CssSlice> = (set) => ({
  importerToCssMap: {},
  setImporterToCssMap: (cssSet: Record<string, string[]>) => {
    set((store) => {
      Object.entries(cssSet).forEach(([importer, cssSet]) => {
        if (!store.importerToCssMap.hasOwnProperty(importer)) {
          store.importerToCssMap[importer] = new Set();
        }
        cssSet.forEach((cssFile) =>
          store.importerToCssMap[importer].add(cssFile)
        );
      });
    });
  },
});

export default createAccountContentSlice;
