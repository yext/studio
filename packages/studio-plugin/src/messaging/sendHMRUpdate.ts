import { ViteDevServer } from "vite";
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
  server: ViteDevServer,
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
  const studioModule = server.moduleGraph.getModuleById("\0virtual:yext-studio");
  if (studioModule) {
    server.moduleGraph.invalidateModule(studioModule);
  }
  server.ws.send({
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
