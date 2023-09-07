import { BaseQueryParams } from "./QueryParams";

export interface EntitiesRequest {
  entityType: string;
  pageNum: number;
}

export interface EntitiesQueryParams extends BaseQueryParams {
  fields: string;
  entityTypes: string;
  offset: number;
  limit: number;
}

export interface EntityData {
  id: string;
  displayName: string;
}

export interface EntitiesResponse {
  entities: EntityData[];
  totalCount: number;
}
