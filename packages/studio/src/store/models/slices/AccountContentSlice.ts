import { SavedFilterData } from "@yext/studio-plugin";
import { EntityData } from "@yext/studio-plugin";

type EntitiesRecord = {
  [entityType: string]: {
    [entityId: string]: EntityData;
  };
};

export default interface AccountContentSlice {
  savedFilters: SavedFilterData[];
  entitiesRecord: EntitiesRecord;
  entityTypes: string[];

  refreshEntityTypes: () => Promise<void>;
  fetchEntities: (entityType: string, pageNum: number) => Promise<void>;
  initialize: () => Promise<void>;
}
