import { SiteSettingsValues } from "./SiteSettings";
import { StudioData } from "./StudioData";

export enum MessageID {
  SaveChanges = "studio:saveChanges",
  StudioHMR = "studio:hmrUpdate",
}

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
  [MessageID.StudioHMR]: StudioHMRPayload;
};

export type ResponseEventMap = {
  [key in MessageID]: {
    type: "success" | "error";
    msg: string;
  };
};
