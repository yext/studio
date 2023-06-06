import { ViteDevServer } from "vite";
import { MessageID, SaveChangesPayload } from "../types.js";
import { registerListener } from "./registerListener.js";
import executeSaveChanges from "./executeSaveChanges.js";
import FileSystemManager from "../FileSystemManager.js";
import GitWrapper from "../git/GitWrapper.js";
import reloadGitData from "../git/reloadGitData.js";
import ParsingOrchestrator from "../ParsingOrchestrator.js";

export default function registerDeployListener(
  server: ViteDevServer,
  fileManager: FileSystemManager,
  gitWrapper: GitWrapper,
  orchestrator: ParsingOrchestrator
) {
  registerListener(
    server,
    MessageID.Deploy,
    async (saveData: SaveChangesPayload) => {
      executeSaveChanges(saveData, fileManager, orchestrator);
      await gitWrapper.deploy();
      await reloadGitData(gitWrapper, server);
      return "Deployed successfully.";
    }
  );
}
