import { SliceCreator } from "../../models/utils";
import AccountContentSlice from "../../models/slices/AccountContentSlice";
import { fetchEntitiesRecord, fetchSavedFilters } from "./utils";

const createAccountContentSlice: SliceCreator<AccountContentSlice> = (set) => ({
  savedFilters: [],
  entitiesRecord: {},
  refreshBaseAccountContent: async () => {
    const savedFilters = await fetchSavedFilters();
    const entitiesRecord = await fetchEntitiesRecord();
    set((store) => {
      store.savedFilters = savedFilters;
      store.entitiesRecord = entitiesRecord;
    });
  },
});

export default createAccountContentSlice;
