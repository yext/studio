import { SiteSettingsValues } from "./SiteSettings.js";
import { StudioData } from "./StudioData.js";

export enum MessageID {
  SaveChanges = "studio:saveChanges",
  Deploy = "studio:deploy",
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

export interface StudioHMRPayload {
  updateType: "siteSettings" | "components" | "modules" | "pages" | "full";
  studioData: StudioData;
}

export type StudioEventMap = {
  [MessageID.SaveChanges]: SaveChangesPayload;
  [MessageID.Deploy]: SaveChangesPayload;
};

export type ResponseEventMap = {
  [key in MessageID]: {
    type: "success" | "error";
    msg: string;
  };
};
