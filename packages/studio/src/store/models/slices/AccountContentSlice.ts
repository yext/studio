import { EntitiesResponse, SavedFilterData } from "@yext/studio-plugin";

type EntitiesRecord = {
  [entityType: string]: EntitiesResponse
};

export default interface AccountContentSlice {
  savedFilters: SavedFilterData[];
  entitiesRecord: EntitiesRecord;
  entityTypes: string[];
  fetchEntities: (entityType: string, pageNum: number) => Promise<void>;
}
