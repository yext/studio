import { EntitiesResponse, MessageID, ResponseType } from "@yext/studio-plugin";
import sendMessage from "../../../messaging/sendMessage";

export async function fetchSavedFilters() {
  const savedFiltersResponse = await sendMessage(
    MessageID.GetSavedFilters,
    null,
    { hideSuccessToast: true }
  );
  return savedFiltersResponse.type === ResponseType.Success
    ? savedFiltersResponse.savedFilters
    : [];
}

export async function fetchEntitiesRecord() {
  const entityTypesResponse = await sendMessage(
    MessageID.GetEntityTypes,
    null,
    { hideSuccessToast: true }
  );
  if (entityTypesResponse.type !== ResponseType.Success) {
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
  return entitiesResponse.type === ResponseType.Success
    ? entitiesResponse.entities
    : { entities: [], totalCount: 0 };
}
