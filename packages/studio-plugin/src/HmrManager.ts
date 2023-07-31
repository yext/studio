import ParsingOrchestrator from "./ParsingOrchestrator";
import { StudioHMRPayload, StudioHMRUpdateID, UserPaths } from "./types";
import { HmrContext, ModuleNode, ViteDevServer } from "vite";
import VirtualModuleID from "./VirtualModuleID";
import upath from "upath";
import LocalDataMappingManager from "./LocalDataMappingManager";

/**
 * HmrManager is responsible for handling studio specific HMR updates.
 */
export default class HmrManager {
  constructor(
    private orchestrator: ParsingOrchestrator,
    private mappingManager: LocalDataMappingManager,
    private pathToUserProjectRoot: string,
    private userPaths: UserPaths,
    private localDataFolder: string
  ) {}

  /**
   * A custom handler for vite hot updates.
   *
   * See import('vite').Plugin.handleHotUpdate
   */
  handleHotUpdate = async (ctx: HmrContext): Promise<Array<ModuleNode> | void> => {
    console.log('hmr update ---', ctx.file)
    const { server, file } = ctx;
    if (upath.normalize(file) === this.mappingManager.mappingPath) {
      this.mappingManager.refreshMapping();
      return [];
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
   * Whether or not a given file should be excluded from being watched.
   * 
   * Currently we ignore all files under localData, to avoid a full page refresh when
   * generate-test-data is called, except for the mapping.json file
   */
  shouldExcludeFromWatch = (filepath: string): boolean => {
    const isLocalDataFile = upath.normalize(filepath).startsWith(this.localDataFolder)
    return isLocalDataFile && upath.basename(filepath) !== 'mapping.json'
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
