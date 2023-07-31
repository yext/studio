import { ViteDevServer } from "vite";
import FileSystemManager from "../FileSystemManager";
import GitWrapper from "../git/GitWrapper";
import reloadGitData from "../git/reloadGitData";
import ParsingOrchestrator from "../ParsingOrchestrator";
import { MessageID, SaveChangesPayload } from "../types";
import executeSaveChanges from "./executeSaveChanges";
import { registerListener } from "./registerListener";

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
      return { type: 'success', msg: "Changes saved successfully." };
    }
  );
}
