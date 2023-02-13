import getStudioConfig from "./parsers/getStudioConfig";
import ParsingOrchestrator from "./ParsingOrchestrator";
import { StudioHMRPayload, StudioHMRUpdateID, UserPaths } from "./types";
import { ViteDevServer } from 'vite';

/**
 * HmrManager is responsible for handling studio specific HMR updates.
 */
export default class HmrManager {
  private shouldSendHotUpdates = true;

  constructor(
    private orchestrator: ParsingOrchestrator,
    private pathToUserProjectRoot: string,
    private userPaths: UserPaths) {}

  pauseHMR() {
    this.shouldSendHotUpdates = false;
    console.log('hmr is tomare', this.shouldSendHotUpdates)
  }

  resumeHMR() {
    this.shouldSendHotUpdates = true;
    console.log('hmr ga ugoki', this.shouldSendHotUpdates)
  }

  /**
   * When an HMR event is received, if there are any associated modules, reload them.
   * Then, if the file can be recognized as one of the user's src files,
   * update the StudioData and send a custom HMR event to the frontend so that special
   * action may be taken. For example, updating the zustand store.
   * 
   * When HMR updates are paused, the orchestrator will update files, but no HMR messages
   * will be send to the client.
   */
  async handleHotUpdate(server: ViteDevServer, filepath: string) {
    if (!filepath.startsWith(this.pathToUserProjectRoot)) {
      return;
    }
    this.orchestrator.reloadFile(filepath);
    console.log('reloaded file', filepath, this.shouldSendHotUpdates)
    if (!this.shouldSendHotUpdates) {
      return;
    }
    const updateType = getHMRUpdateType(filepath, this.userPaths)
    const data = await this.getPayload(updateType);
    server.ws.send({
      type: "custom",
      event: StudioHMRUpdateID,
      data,
    });
  }

  async sendFullUpdate(server: ViteDevServer) {
    if (!this.shouldSendHotUpdates) {
      throw new Error("Tried to send a full update when HMR was paused.");
    }
    const data = await this.getPayload("full");
    server.ws.send({
      type: "custom",
      event: StudioHMRUpdateID,
      data,
    });
  }

  private async getPayload(updateType: StudioHMRPayload['updateType']): Promise<StudioHMRPayload> {
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