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
  GetCodeCompletion = "studio:getCodeCompletion",
  GetTextGeneration = "studio:getTextGeneration",
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

export interface GetCompletionPayload {
  prompt: string;
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
  [MessageID.GetCodeCompletion]: GetCompletionPayload;
  [MessageID.GetTextGeneration]: GetCompletionPayload;
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
  file: string;
  metadata?: string;
  msg: string;
}

type WriteResponse = {
  type: "success";
  msg: string;
  originalFile: string;
};

export type ResponseEventMap = {
  [MessageID.Deploy]: BaseResponse;
  [MessageID.SaveChanges]: BaseResponse;
  [MessageID.GenerateTestData]: BaseResponse & {
    mappingJson: Record<string, string[]>;
  };
  [MessageID.WriteFile]: WriteResponse;
  [MessageID.GetAllComponentFilepaths]: FilepathsResponse;
  [MessageID.GetComponentFile]: FileResponse;
  [MessageID.GetCodeCompletion]: FileResponse;
  [MessageID.GetTextGeneration]: FileResponse
};
