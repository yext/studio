
import CssSlice from "../models/slices/CssSlice";
import { SliceCreator } from "../models/utils";

const createAccountContentSlice: SliceCreator<CssSlice> = (set) => ({
  cssToImporterMap: {},
  setCssToImporterMap: (id: string, importersSet: string[]) => {
    set((store) => {
      if (!store.cssToImporterMap.hasOwnProperty(id)) {
        store.cssToImporterMap[id] = new Set();
      }
      importersSet.forEach(importer => store.cssToImporterMap[id].add(importer))
    });
  }
});

export default createAccountContentSlice;
