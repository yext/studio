export interface QueryParams {
  [key: string]: string | number | boolean;
}

export interface BaseQueryParams extends QueryParams {
  api_key: string;
  v: number;
}
