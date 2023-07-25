import ParsingOrchestrator from "./ParsingOrchestrator";
import { StudioHMRPayload, StudioHMRUpdateID, UserPaths } from "./types";
import { HmrContext, ViteDevServer } from "vite";
import VirtualModuleID from "./VirtualModuleID";
import upath from "upath";

/**
 * HmrManager is responsible for handling studio specific HMR updates.
 */
export default class HmrManager {
  private localDataFolder: string;
  private mappingJsonPath: string;

  constructor(
    private orchestrator: ParsingOrchestrator,
    private pathToUserProjectRoot: string,
    private userPaths: UserPaths
  ) {
    this.localDataFolder = upath.join(pathToUserProjectRoot, "localData");
    this.mappingJsonPath = upath.join(this.localDataFolder, "mapping.json");
  }

  /**
   * If the file can be recognized as one of the user's src files,
   * update the StudioData and send a custom HMR event to the frontend.
   */
  async handleHotUpdate(ctx: HmrContext) {
    const { server, file } = ctx;
    if (file.startsWith(this.localDataFolder)) {
      return this.handleLocalDataUpdate(ctx);
    }

    await HmrManager.reloadAssociatedModules(ctx);
    if (!file.startsWith(this.pathToUserProjectRoot)) {
      return;
    }
    this.orchestrator.reloadFile(file);
    HmrManager.invalidateStudioData(server);
    const updateType = getHMRUpdateType(file, this.userPaths);
    const data = this.getPayload(updateType);
    server.ws.send({
      type: "custom",
      event: StudioHMRUpdateID,
      data,
    });
  }

  /**
   * When any file under localData is updated, invalidate the associated
   * modules for the file and also the mapping.json file.
   *
   * Return an empty array to prevent vite's default HMR behavior, which
   * would cause the page to reload.
   */
  private handleLocalDataUpdate(ctx: HmrContext) {
    ctx.modules?.forEach((m) => {
      ctx.server.moduleGraph.invalidateModule(m);
    });
    const mappingJsonModules = ctx.server.moduleGraph.getModulesByFile(
      this.mappingJsonPath
    );
    mappingJsonModules?.forEach((m) => {
      ctx.server.moduleGraph.invalidateModule(m);
    });
    return [];
  }

  private static async reloadAssociatedModules(ctx: HmrContext) {
    const reloadModulePromises = ctx.modules.map((m) => {
      return ctx.server.reloadModule(m);
    });
    await Promise.all(reloadModulePromises);
  }

  /**
   * Tells the client it needs to refresh its StudioData.
   */
  private static invalidateStudioData(server: ViteDevServer) {
    const studioModule = server.moduleGraph.getModuleById(
      "\0" + VirtualModuleID.StudioData
    );
    if (studioModule) {
      server.moduleGraph.invalidateModule(studioModule);
    }
  }

  private getPayload(
    updateType: StudioHMRPayload["updateType"]
  ): StudioHMRPayload {
    const studioData = this.orchestrator.getStudioData();
    return {
      updateType,
      studioData,
    };
  }
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
