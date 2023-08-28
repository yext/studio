import crossFetch from "cross-fetch";
import { QueryParams } from "./types/QueryParams";

/**
 * The basic structure of a response from the Management API.
 */
interface ApiResponse {
  response: unknown;
  meta: {
    uuid: string;
    errors: {
      message: string;
      code: number;
      type: string;
    }[];
  };
}

/**
 * HttpService is a wrapper around the native implementation of AJAX-related
 * matters.
 */
export class HttpService {
  /**
   * Performs a GET request.
   */
  static async get(
    url: string,
    queryParams: QueryParams
  ): Promise<ApiResponse> {
    const response = await fetch(url, queryParams, {
      method: "get",
      mode: "cors",
    }).then((res) => res.json());

    validateApiResponse(response);
    return response;
  }
}

/**
 * Performs a fetch using cross-fetch.
 */
function fetch(
  url: string,
  queryParams: QueryParams,
  reqInit: RequestInit
): Promise<Response> {
  const urlWithParams = addParamsToURL(url, queryParams);
  return crossFetch(urlWithParams, reqInit);
}

/**
 * Updates a url with the given params.
 */
function addParamsToURL(url: string, params: QueryParams): string {
  const parsedUrl = new URL(url);
  const urlParams = new URLSearchParams(parsedUrl.search.substring(1));

  Object.entries(params).forEach(([key, value]) =>
    urlParams.append(key, value.toString())
  );
  const updatedUrl = parsedUrl.origin + parsedUrl.pathname;
  return [updatedUrl, urlParams.toString()].join("?");
}

/**
 * Throws an error if the reponse is malformed or contains any errors.
 */
function validateApiResponse(apiResponse: ApiResponse) {
  const responseString = JSON.stringify(apiResponse, null, 2);
  if (!apiResponse.response || !apiResponse.meta) {
    throw new Error(`Malformed API Response: ${responseString}`);
  }
  if (apiResponse.meta.errors?.length > 0) {
    throw new Error(`Error in API Response: ${responseString}`);
  }
}
