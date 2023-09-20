import { SliceCreator } from "../../models/utils";
import AccountContentSlice from "../../models/slices/AccountContentSlice";
import {
  fetchEntities,
  fetchInitialEntitiesRecord,
  fetchSavedFilters,
} from "./utils";

const createAccountContentSlice: SliceCreator<AccountContentSlice> = (set) => ({
  savedFilters: [],
  entitiesRecord: {},
  refreshBaseAccountContent: async () => {
    try {
      const [savedFilters, entitiesRecord] = await Promise.all([
        fetchSavedFilters(),
        fetchInitialEntitiesRecord(),
      ]);
      set((store) => {
        store.savedFilters = savedFilters;
        store.entitiesRecord = entitiesRecord;
      });
    } catch (e) {
      console.error("Unable to fetch account content.", e);
    }
  },
  async fetchEntities(entityType: string, pageNum: number): Promise<void> {
    const res = await fetchEntities(entityType, pageNum);
    if (!res) {
      return;
    }

    set((state) => {
      state.entitiesRecord[entityType].entities.push(...res.entities);
    });
  },
});

export default createAccountContentSlice;
