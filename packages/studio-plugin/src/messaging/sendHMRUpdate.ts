import { WebSocketServer } from "vite";
import getStudioConfig from "../parsers/getStudioConfig";
import {
  StudioData,
  StudioHMRPayload,
  StudioHMRUpdateID,
  UserPaths,
} from "../types";

export default async function sendHMRUpdate(
  studioData: StudioData,
  filepath: string,
  server: WebSocketServer,
  pathToUserProjectRoot: string,
  userPaths: UserPaths
) {
  const studioConfig = await getStudioConfig(pathToUserProjectRoot);
  const data: StudioHMRPayload = {
    updateType: getHMRUpdateType(filepath, userPaths),
    studioData: {
      ...studioData,
      userPaths: studioConfig.paths,
    },
  };
  server.send({
    type: "custom",
    event: StudioHMRUpdateID,
    data,
  });
}

function getHMRUpdateType(file: string, userPaths: UserPaths) {
  const updateTypes: Exclude<keyof UserPaths, "localData">[] = [
    "siteSettings",
    "components",
    "modules",
    "pages",
  ];
  return (
    updateTypes.find((updateType) => {
      return file.startsWith(userPaths[updateType]);
    }) ?? "full"
  );
}
