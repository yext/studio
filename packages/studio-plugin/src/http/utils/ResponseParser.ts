/* eslint-disable @typescript-eslint/no-explicit-any */
import { EntitiesResponse } from "../types/Entities";
import { SavedFilterData } from "../types/SavedFilters";

/**
 * Parses the response from the API to get the specific data needed.
 */
export default class ResponseParser {
  static parseEntitiesResponse = (response: any): EntitiesResponse => {
    const rawEntities = Array.isArray(response.entities)
      ? response.entities
      : [];
    const parsedEntities = rawEntities.map((entity) => ({
      id: entity.meta.id,
      displayName: entity.name,
    }));
    return {
      entities: parsedEntities,
      totalCount: response.count,
    };
  };

  static parseEnabledEntityTypes = (response: any): string[] => {
    const rawEntityTypes = Array.isArray(response.entityTypeSettings)
      ? response.entityTypeSettings
      : [];
    return rawEntityTypes
      .filter((t) => t.disabled === false)
      .map((t) => t.entityType);
  };

  static parseSavedFilterIds = (response: any): string[] => {
    return Array.isArray(response) ? response : [];
  };

  static parseSavedFilterData = (response: any): SavedFilterData => {
    return {
      id: response.$id,
      displayName: response.name,
    };
  };
}
