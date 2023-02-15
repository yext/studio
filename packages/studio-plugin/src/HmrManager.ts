import getStudioConfig from "./parsers/getStudioConfig";
import ParsingOrchestrator from "./ParsingOrchestrator";
import { StudioHMRPayload, StudioHMRUpdateID, UserPaths } from "./types";
import { ViteDevServer } from "vite";
import VirtualModuleID from "./VirtualModuleID";

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
   * If the file can be recognized as one of the user's src files,
   * update the StudioData and send a custom HMR event to the frontend.
   */
  async handleHotUpdate(server: ViteDevServer, filepath: string) {
    if (!filepath.startsWith(this.pathToUserProjectRoot)) {
      return;
    }
    this.orchestrator.reloadFile(filepath);
    HmrManager.invalidateStudioData(server);
    const updateType = getHMRUpdateType(filepath, this.userPaths);
    const data = await this.getPayload(updateType);
    server.ws.send({
      type: "custom",
      event: StudioHMRUpdateID,
      data,
    });
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

  private async getPayload(
    updateType: StudioHMRPayload["updateType"]
  ): Promise<StudioHMRPayload> {
    const studioData = this.orchestrator.getStudioData();
    const studioConfig = await getStudioConfig(this.pathToUserProjectRoot);
    return {
      updateType,
      studioData: {
        ...studioData,
        userPaths: studioConfig.paths,
      },
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
