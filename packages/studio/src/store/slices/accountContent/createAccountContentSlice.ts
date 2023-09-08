import { SliceCreator } from "../../models/utils";
import AccountContentSlice from "../../models/slices/AccountContentSlice";
import {
  fetchEntities,
  fetchInitialEntitiesRecord,
  fetchSavedFilters,
} from "./utils";
import { EntityData } from "@yext/studio-plugin";

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

    const entityIdToEntityData: Record<string, EntityData> =
      res.entities.reduce((prev, curr) => {
        prev[curr.id] = curr;
        return prev;
      }, {});

    set((state) => {
      state.entitiesRecord[entityType].entities = {
        ...state.entitiesRecord[entityType].entities,
        ...entityIdToEntityData,
      };
    });
  },
});

export default createAccountContentSlice;
