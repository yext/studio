import ParsingOrchestrator from "./ParsingOrchestrator";
import { StudioHMRPayload, StudioHMRUpdateID, UserPaths } from "./types";
import { HmrContext, ViteDevServer } from "vite";
import VirtualModuleID from "./VirtualModuleID";
import upath from "upath";

/**
 * HmrManager is responsible for handling studio specific HMR updates.
 */
export default class HmrManager {
  constructor(
    private orchestrator: ParsingOrchestrator,
    private pathToUserProjectRoot: string,
    private userPaths: UserPaths
  ) {}

  /**
   * A custom handler for vite hot updates.
   *
   * See import('vite').Plugin.handleHotUpdate
   */
  handleHotUpdate = async (ctx: HmrContext) => {
    const { server, file } = ctx;

    if (!file.startsWith(this.pathToUserProjectRoot)) {
      await HmrManager.reloadAssociatedModules(ctx);
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
  };

  /**
   * Whether or not a given file should be excluded from being watched.
   *
   * Currently we ignore all files under localData, to avoid a full page refresh when
   * the generate-test-data yext CLI command is called
   */
  shouldExcludeFromWatch = (filepath: string): boolean => {
    return upath.normalize(filepath).startsWith(this.userPaths.localData);
  };

  private static async reloadAssociatedModules(ctx: HmrContext) {
    const reloadModulePromises = ctx.modules.map((m) => {
      console.log("reloading module", m.file, m.importers);
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
