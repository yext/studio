import { ViteDevServer } from "vite";
import { MessageID, ResponseType, SaveChangesPayload } from "../types";
import { registerListener } from "./registerListener";
import executeSaveChanges from "./executeSaveChanges";
import FileSystemManager from "../FileSystemManager";
import GitWrapper from "../git/GitWrapper";
import reloadGitData from "../git/reloadGitData";
import ParsingOrchestrator from "../ParsingOrchestrator";

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
      return { type: ResponseType.Success, msg: "Deployed successfully." };
    }
  );
}
