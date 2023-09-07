import { SliceCreator } from "../../models/utils";
import AccountContentSlice from "../../models/slices/AccountContentSlice";
import { fetchEntitiesRecord, fetchSavedFilters } from "./utils";

const createAccountContentSlice: SliceCreator<AccountContentSlice> = (set) => ({
  savedFilters: [],
  entitiesRecord: {},
  refreshBaseAccountContent: async () => {
    try {
      const [savedFilters, entitiesRecord] = await Promise.all([
        fetchSavedFilters(),
        fetchEntitiesRecord(),
      ]);
      set((store) => {
        store.savedFilters = savedFilters;
        store.entitiesRecord = entitiesRecord;
      });
    } catch (e) {
      console.error("Unable to fetch account content.", e);
    }
  },
});

export default createAccountContentSlice;
