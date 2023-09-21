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

export async function fetchInitialEntitiesRecord() {
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
          const entitiesResponse = (await fetchEntities(entityType, 0)) ?? {
            entities: [],
            totalCount: 0,
          };
          return [entityType, entitiesResponse];
        }
      )
    )
  ).filter(([_, entitiesResponse]) => entitiesResponse.totalCount > 0);
  const typeToEntitiesMap = Object.fromEntries(typeToEntitiesEntries);
  return typeToEntitiesMap;
}

export async function fetchEntities(
  entityType: string,
  pageNum: number
): Promise<EntitiesResponse | undefined> {
  const res = await sendMessage(
    MessageID.GetEntities,
    {
      entityType,
      pageNum,
    },
    { hideSuccessToast: true }
  );
  if (res.type === ResponseType.Success) {
    return res.entities;
  }
  console.error(res.msg);
}
