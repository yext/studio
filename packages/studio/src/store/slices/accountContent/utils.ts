import { EntitiesResponse, MessageID, ResponseType } from "@yext/studio-plugin";
import sendMessage from "../../../messaging/sendMessage";

export async function fetchSavedFilters() {
  const savedFiltersResponse = await sendMessage(
    MessageID.GetSavedFilters,
    null,
    { hideSuccessToast: true }
  );
  if (savedFiltersResponse.type === ResponseType.Success) {
    return savedFiltersResponse.savedFilters;
  }
  console.error(savedFiltersResponse.msg);
  return [];
}

export async function fetchEntitiesRecord() {
  const entityTypesResponse = await sendMessage(
    MessageID.GetEntityTypes,
    null,
    { hideSuccessToast: true }
  );
  if (entityTypesResponse.type !== ResponseType.Success) {
    console.error(entityTypesResponse.msg);
    return {};
  }

  const typeToEntitiesEntries = (
    await Promise.all(
      entityTypesResponse.entityTypes.map(
        async (entityType): Promise<[string, EntitiesResponse]> => {
          const entitiesResponse = await fetchInitialEntities(entityType);
          return [entityType, entitiesResponse];
        }
      )
    )
  ).filter(([_, entitiesResponse]) => entitiesResponse.totalCount > 0);
  const typeToEntitiesMap = Object.fromEntries(typeToEntitiesEntries);
  return typeToEntitiesMap;
}

async function fetchInitialEntities(entityType: string) {
  const entitiesResponse = await sendMessage(
    MessageID.GetEntities,
    {
      entityType,
      pageNum: 0,
    },
    { hideSuccessToast: true }
  );
  if (entitiesResponse.type === ResponseType.Success) {
    return entitiesResponse.entities;
  }
  console.error(entitiesResponse.msg);
  return { entities: [], totalCount: 0 };
}
