import { SiteSettingsValues } from './SiteSettings';
import { StudioData } from "./StudioData";

export enum MessageID {
  StudioCommitChanges = "studio:commitChanges",
}

export interface CommitChangesEventPayload
  extends Pick<StudioData, "pageNameToPageState" | "UUIDToFileMetadata"> {
  pendingChanges: {
    pagesToRemove: string[];
    pagesToUpdate: string[];
    modulesToUpdate: string[];
  }
  siteSettings: {
    values?: SiteSettingsValues;
  };
}

export type StudioEventMap = {
  [MessageID.StudioCommitChanges]: CommitChangesEventPayload;
};

export type ResponseEventMap = {
  [key in MessageID]: {
    type: "success" | "error";
    msg: string;
  };
};
