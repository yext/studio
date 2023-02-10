import { SiteSettingsValues } from "./SiteSettings";
import { StudioData } from "./StudioData";

export enum MessageID {
  SaveChanges = "studio:saveChanges",
  Deploy = "studio:deploy",
  CanPush = "studio:canPush",
}
export const StudioHMRUpdateID = "studio:hmrUpdate";

export interface SaveChangesPayload
  extends Pick<StudioData, "pageNameToPageState" | "UUIDToFileMetadata"> {
  pendingChanges: {
    pagesToRemove: string[];
    pagesToUpdate: string[];
    modulesToUpdate: string[];
  };
  siteSettings: {
    values?: SiteSettingsValues;
  };
}

export interface StudioHMRPayload {
  updateType: "siteSettings" | "components" | "modules" | "pages" | "full";
  studioData: StudioData;
}

export type StudioEventMap = {
  [MessageID.SaveChanges]: SaveChangesPayload;
  [MessageID.Deploy]: SaveChangesPayload;
  [MessageID.CanPush]: undefined;
};

type EventResponse<R = never> = {
  type: "success";
  msg: string;
  uuid: string;
  res: R;
} | {
  type: "error";
  msg: string;
  uuid: string;
  res?: never;
}

export type ResponseEventMap = {
  [MessageID.Deploy]: EventResponse
  [MessageID.SaveChanges]: EventResponse
  [MessageID.CanPush]: EventResponse<{
    canPush: boolean,
    reason?: string
  }>
};
