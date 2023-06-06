import { ViteDevServer } from "vite";
import FileSystemManager from "../FileSystemManager.js";
import GitWrapper from "../git/GitWrapper.js";
import reloadGitData from "../git/reloadGitData.js";
import ParsingOrchestrator from "../ParsingOrchestrator.js";
import { MessageID, SaveChangesPayload } from "../types/index.js";
import executeSaveChanges from "./executeSaveChanges.js";
import { registerListener } from "./registerListener.js";

export default function registerSaveChangesListener(
  server: ViteDevServer,
  fileManager: FileSystemManager,
  gitWrapper: GitWrapper,
  orchestrator: ParsingOrchestrator
) {
  registerListener(
    server,
    MessageID.SaveChanges,
    async (saveData: SaveChangesPayload) => {
      executeSaveChanges(saveData, fileManager, orchestrator);
      await reloadGitData(gitWrapper, server);
      return "Changes saved successfully.";
    }
  );
}
