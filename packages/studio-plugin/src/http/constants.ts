export const DEFAULT_API_VERSION = 20220511;
const MANAGEMENT_API_ORIGIN = "https://api.yextapis.com";
export const MANAGEMENT_API_ENDPOINTS = {
  entities: `${MANAGEMENT_API_ORIGIN}/v2/accounts/me/entities`,
  entityTypes: `${MANAGEMENT_API_ORIGIN}/v2/accounts/me/config/resources/km/settings/config`,
  savedFilterIds: `${MANAGEMENT_API_ORIGIN}/v2/accounts/me/config/resourcenames/km/saved-filter`,
  savedFilterData: `${MANAGEMENT_API_ORIGIN}/v2/accounts/me/config/resources/km/saved-filter/`,
};
