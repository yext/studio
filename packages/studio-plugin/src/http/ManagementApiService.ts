import { HttpService } from "./HttpService";
import { DEFAULT_API_VERSION, MANAGEMENT_API_ENDPOINTS } from "./constants";
import {
  EntitiesQueryParams,
  EntitiesRequest,
  EntitiesResponse,
} from "./types/Entities";
import { BaseQueryParams } from "./types/QueryParams";
import { SavedFilterData } from "./types/SavedFilters";
import ResponseParser from "./utils/ResponseParser";

/**
 * ManagementApiService handles making requests to the Management API for an
 * account that matches the given API key.
 */
export default class ManagementApiService {
  private baseQueryParams: BaseQueryParams;

  constructor(apiKey: string) {
    this.baseQueryParams = {
      api_key: apiKey,
      v: DEFAULT_API_VERSION,
    };
  }

  /**
   * Gets up to 50 entities of the specified entity type.
   */
  async getEntities(request: EntitiesRequest): Promise<EntitiesResponse> {
    const maxLimit = 50;
    const queryParams: EntitiesQueryParams = {
      ...this.baseQueryParams,
      fields: "name",
      entityTypes: request.entityType,
      offset: request.pageNum * maxLimit,
      limit: maxLimit,
    };

    const apiResponse = await HttpService.get(
      MANAGEMENT_API_ENDPOINTS.entities,
      queryParams
    );

    return ResponseParser.parseEntitiesResponse(apiResponse.response);
  }

  /**
   * Gets the API name for each enabled entity type in the account.
   */
  async getEnabledEntityTypes(): Promise<string[]> {
    const apiResponse = await HttpService.get(
      MANAGEMENT_API_ENDPOINTS.entityTypes,
      this.baseQueryParams
    );

    return ResponseParser.parseEnabledEntityTypes(apiResponse.response);
  }

  /**
   * Gets all the saved filters in the account.
   */
  async getSavedFilters(): Promise<SavedFilterData[]> {
    const apiResponse = await HttpService.get(
      MANAGEMENT_API_ENDPOINTS.savedFilterIds,
      this.baseQueryParams
    );

    const savedFilterIds = ResponseParser.parseSavedFilterIds(
      apiResponse.response
    );
    return Promise.all(savedFilterIds.map(this.getSavedFilterData));
  }

  private getSavedFilterData = async (id: string): Promise<SavedFilterData> => {
    const apiResponse = await HttpService.get(
      MANAGEMENT_API_ENDPOINTS.savedFilterData + id,
      this.baseQueryParams
    );

    return ResponseParser.parseSavedFilterData(apiResponse.response);
  };
}
