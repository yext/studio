import { HmrContext } from "vite";
import getStudioConfig from "./parsers/getStudioConfig";
import ParsingOrchestrator from "./ParsingOrchestrator";
import { UserPaths, StudioData } from "./types";

export default function createHandleHotUpdate(
  orchestrator: ParsingOrchestrator,
  pathToUserProjectRoot: string,
  userPaths: UserPaths
) {
  return async function (ctx: HmrContext) {
    ctx.modules.forEach((m) => ctx.server.reloadModule(m));
    if (!ctx.file.startsWith(pathToUserProjectRoot)) {
      return;
    }

    orchestrator.reloadFile(ctx.file);
    const studioData = await orchestrator.getStudioData();
    const studioConfig = await getStudioConfig(pathToUserProjectRoot);
    const data: StudioHMRPayload = {
      updateType: getHMRUpdateType(ctx.file, userPaths),
      studioData: {
        ...studioData,
        userPaths: studioConfig.paths
      },
    };
    ctx.server.ws.send({
      type: "custom",
      event: "studio:update",
      data,
    });
  };
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

export type StudioHMRPayload = {
  updateType: "siteSettings" | "components" | "modules" | "pages" | "full";
  studioData: StudioData;
};
