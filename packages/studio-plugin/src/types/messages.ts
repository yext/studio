import { SiteSettingsValues } from "./SiteSettings";
import { StudioData } from "./StudioData";
import { FeaturesJson } from "./PagesJS";
import { EntitiesRequest, EntitiesResponse } from "../http/types/Entities";
import { SavedFilterData } from "../http/types/SavedFilters";

export enum MessageID {
  SaveChanges = "studio:saveChanges",
  Deploy = "studio:deploy",
  GenerateTestData = "studio:generateTestData",
  GetEntities = "studio:getEntities",
  GetSavedFilters = "studio:getSavedFilters",
  GetEntityTypes = "studio:getEntityTypes",
}
export const StudioHMRUpdateID = "studio:hmrUpdate";

export interface SaveChangesPayload
  extends Pick<StudioData, "pageNameToPageState" | "UUIDToFileMetadata"> {
  pendingChanges: {
    pagesToRemove: string[];
    pagesToUpdate: string[];
  };
  siteSettings: {
    values?: SiteSettingsValues;
  };
}

export interface GenerateTestDataPayload {
  featuresJson: FeaturesJson;
}

export interface StudioHMRPayload {
  updateType: "siteSettings" | "components" | "modules" | "pages" | "full";
  studioData: StudioData;
  file: string;
}

export type StudioEventMap = {
  [MessageID.SaveChanges]: SaveChangesPayload;
  [MessageID.Deploy]: SaveChangesPayload;
  [MessageID.GenerateTestData]: GenerateTestDataPayload;
  [MessageID.GetEntities]: EntitiesRequest;
  [MessageID.GetSavedFilters]: null;
  [MessageID.GetEntityTypes]: null;
};

export enum ResponseType {
  Success = "success",
  Error = "error",
  Fatal = "fatal",
}

export type BaseResponse = {
  type: ResponseType.Success;
  msg: string;
};

export type ErrorResponse = {
  type: ResponseType.Error;
  msg: string;
};

export type FatalErrorResponse = {
  type: ResponseType.Fatal;
  msg: string;
};

type ManagementApiResponse<T> = ErrorResponse | (BaseResponse & T);

export type ResponseEventMap = {
  [MessageID.Deploy]: BaseResponse;
  [MessageID.SaveChanges]: BaseResponse;
  [MessageID.GenerateTestData]: (BaseResponse | ErrorResponse) & {
    mappingJson: Record<string, string[]>;
  };
  [MessageID.GetEntities]: ManagementApiResponse<{
    entities: EntitiesResponse;
  }>;
  [MessageID.GetSavedFilters]: ManagementApiResponse<{
    savedFilters: SavedFilterData[];
  }>;
  [MessageID.GetEntityTypes]: ManagementApiResponse<{ entityTypes: string[] }>;
};
