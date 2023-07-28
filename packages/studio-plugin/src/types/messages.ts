import { SiteSettingsValues } from "./SiteSettings";
import { StudioData } from "./StudioData";
import { FeaturesJson } from "./PagesJS";

export enum MessageID {
  SaveChanges = "studio:saveChanges",
  Deploy = "studio:deploy",
  GenerateTestData = "studio:generateTestData",
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
}

export type StudioEventMap = {
  [MessageID.SaveChanges]: SaveChangesPayload;
  [MessageID.Deploy]: SaveChangesPayload;
  [MessageID.GenerateTestData]: GenerateTestDataPayload;
};

export type ResponseEventMap = {
  [key in MessageID]: {
    type: "success" | "error";
    msg: string;
  };
};
