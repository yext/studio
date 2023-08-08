import { SiteSettingsValues } from "./SiteSettings";
import { StudioData } from "./StudioData";
import { FeaturesJson } from "./PagesJS";

export enum MessageID {
  SaveChanges = "studio:saveChanges",
  Deploy = "studio:deploy",
  GenerateTestData = "studio:generateTestData",
  WriteFile = "studio:writeFile",
  GetAllComponentFilepaths = "studio:getAllComponentFilepaths",
  GetComponentFile = "studio:getComponentFile",
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

export interface WriteFilePayload {
  dataToWrite: string;
  filepath: string;
}

export interface GetAllComponentFilepathsPayload {}

export interface GetComponentFilePayload {
  filepath: string;
}

export interface StudioHMRPayload {
  updateType: "siteSettings" | "components" | "modules" | "pages" | "full";
  studioData: StudioData;
}

export type StudioEventMap = {
  [MessageID.SaveChanges]: SaveChangesPayload;
  [MessageID.Deploy]: SaveChangesPayload;
  [MessageID.GenerateTestData]: GenerateTestDataPayload;
  [MessageID.WriteFile]: WriteFilePayload;
  [MessageID.GetAllComponentFilepaths]: GetAllComponentFilepathsPayload;
  [MessageID.GetComponentFile]: GetComponentFilePayload;
};

type BaseResponse = {
  type: "success";
  msg: string;
};

export type ErrorResponse = {
  type: "error";
  msg: string;
};

type FilepathsResponse = {
  type: "data";
  filepaths: string[]
  msg: string;
}

type FileResponse = {
  type: "data";
  file: string
  msg: string;
}

export type ResponseEventMap = {
  [MessageID.Deploy]: BaseResponse;
  [MessageID.SaveChanges]: BaseResponse;
  [MessageID.GenerateTestData]: BaseResponse & {
    mappingJson: Record<string, string[]>;
  };
  [MessageID.WriteFile]: BaseResponse;
  [MessageID.GetAllComponentFilepaths]: FilepathsResponse;
  [MessageID.GetComponentFile]: FileResponse;
};
