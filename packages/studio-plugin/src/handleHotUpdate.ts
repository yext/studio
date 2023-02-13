import { HmrContext } from "vite";
import sendHMRUpdate from "./messaging/sendHMRUpdate";
import ParsingOrchestrator from "./ParsingOrchestrator";
import { UserPaths } from "./types";

/**
 * Factory method for creating our handleHotUpdate handler.
 */
export default function createHandleHotUpdate(
  orchestrator: ParsingOrchestrator,
  pathToUserProjectRoot: string,
  userPaths: UserPaths
) {
  /**
   * When an HMR event is received, if there are any associated modules, reload them.
   * Then, if the file can be recognized as one of the user's src files,
   * update the StudioData and send a custom HMR event to the frontend so that special
   * action may be taken. For example, updating the zustand store.
   */
  return async function (ctx: HmrContext) {
    const reloadModulePromises = ctx.modules.map((m) => {
      return ctx.server.reloadModule(m);
    });
    await Promise.all(reloadModulePromises);
    if (!ctx.file.startsWith(pathToUserProjectRoot)) {
      return;
    }

    console.log('on hot update', ctx.file)
    orchestrator.reloadFile(ctx.file);
    const studioData = orchestrator.getStudioData();
    sendHMRUpdate(
      studioData,
      ctx.file,
      ctx.server,
      pathToUserProjectRoot,
      userPaths
    );
  };
}
