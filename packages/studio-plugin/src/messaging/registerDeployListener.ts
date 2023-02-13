import { ViteDevServer } from "vite";
import { MessageID, SaveChangesPayload } from "../types";
import { registerListener } from "./registerListener";
import executeSaveChanges from "./executeSaveChanges";
import FileSystemManager from "../FileSystemManager";
import GitWrapper from "../git/GitWrapper";
import reloadGitData from "../git/reloadGitData";
import HmrManager from "../HmrManager";

export default function registerDeployListener(
  server: ViteDevServer,
  fileManager: FileSystemManager,
  gitWrapper: GitWrapper,
  hmrManager: HmrManager
) {
  registerListener(
    server,
    MessageID.Deploy,
    async (saveData: SaveChangesPayload) => {
      executeSaveChanges(saveData, fileManager, hmrManager, server);
      await gitWrapper.deploy();
      await reloadGitData(gitWrapper, server);
      return "Deployed successfully.";
    }
  );
}
