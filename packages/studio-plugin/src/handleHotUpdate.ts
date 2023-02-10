import { HmrContext } from "vite";
import GitWrapper from "./git/GitWrapper";
import reloadGitData from "./git/reloadGitData";
import getStudioConfig from "./parsers/getStudioConfig";
import ParsingOrchestrator from "./ParsingOrchestrator";
import { UserPaths } from "./types";
import { StudioHMRPayload, StudioHMRUpdateID } from "./types/messages";

/**
 * Factory method for creating our handleHotUpdate handler.
 */
export default function createHandleHotUpdate(
  orchestrator: ParsingOrchestrator,
  pathToUserProjectRoot: string,
  userPaths: UserPaths,
  gitWrapper: GitWrapper
) {
  /**
   * When an HMR event is received, if there are any associated modules, reload them.
   * Then, if the file can be recognized as one of the user's src files,
   * update the StudioData and send a custom HMR event to the frontend so that special
   * action may be taken. For example, updating the zustand store.
   */
  return async function (ctx: HmrContext) {
    ctx.modules.forEach((m) => ctx.server.reloadModule(m));
    if (!ctx.file.startsWith(pathToUserProjectRoot)) {
      return;
    }
    orchestrator.reloadFile(ctx.file);
    const studioData = orchestrator.getStudioData();
    const studioConfig = await getStudioConfig(pathToUserProjectRoot);
    const data: StudioHMRPayload = {
      updateType: getHMRUpdateType(ctx.file, userPaths),
      studioData: {
        ...studioData,
        userPaths: studioConfig.paths,
      },
    };
    ctx.server.ws.send({
      type: "custom",
      event: StudioHMRUpdateID,
      data,
    });
    await reloadGitData(gitWrapper, ctx.server);
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
