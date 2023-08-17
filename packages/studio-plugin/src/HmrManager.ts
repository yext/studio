import ParsingOrchestrator from "./ParsingOrchestrator";
import { StudioHMRPayload, StudioHMRUpdateID, UserPaths } from "./types";
import { ViteDevServer } from "vite";
import VirtualModuleID from "./VirtualModuleID";
import chokidar from "chokidar";
import upath from "upath";

/**
 * HmrManager is responsible for handling studio specific HMR updates.
 */
export default class HmrManager {
  constructor(
    private server: ViteDevServer,
    private orchestrator: ParsingOrchestrator,
    private userPaths: UserPaths
  ) {}

  createWatcher(pathToUserProjectRoot: string) {
    const watcher = chokidar.watch(upath.join(pathToUserProjectRoot, "src"), {
      ignoreInitial: true,
    });
    watcher.on("change", this.handleHotUpdate);
    watcher.on("unlink", this.handleHotUpdate);
    watcher.on("add", this.handleHotUpdate);
  }

  /**
   * A custom handler for vite hot updates.
   *
   * See import('vite').Plugin.handleHotUpdate
   */
  handleHotUpdate = (unnormalizedFilepath: string) => {
    const file = upath.normalize(unnormalizedFilepath);
    this.orchestrator.reloadFile(file);
    this.invalidateStudioData();
    const updateType = getHMRUpdateType(file, this.userPaths);
    const data = this.getPayload(updateType, file);
    this.server.ws.send({
      type: "custom",
      event: StudioHMRUpdateID,
      data,
    });
  };

  /**
   * Tells the client it needs to refresh its StudioData.
   */
  private invalidateStudioData() {
    const studioModule = this.server.moduleGraph.getModuleById(
      "\0" + VirtualModuleID.StudioData
    );
    if (studioModule) {
      this.server.moduleGraph.invalidateModule(studioModule);
    }
  }

  private getPayload(
    updateType: StudioHMRPayload["updateType"],
    file: string
  ): StudioHMRPayload {
    const studioData = this.orchestrator.getStudioData();
    return {
      updateType,
      studioData,
      file,
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
