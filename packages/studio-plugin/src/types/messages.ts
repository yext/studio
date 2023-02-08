import { SiteSettingsValues } from "./SiteSettings";
import { StudioData } from "./StudioData";

export enum MessageID {
  SaveChanges = "studio:saveChanges",
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

export type StudioEventMap = {
  [MessageID.SaveChanges]: SaveChangesPayload;
};

export type ResponseEventMap = {
  [key in MessageID]: {
    type: "success" | "error";
    msg: string;
  };
};
