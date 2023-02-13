import { ViteDevServer } from "vite";
import FileSystemManager from "../FileSystemManager";
import GitWrapper from "../git/GitWrapper";
import reloadGitData from "../git/reloadGitData";
import HmrManager from "../HmrManager";
import { MessageID, SaveChangesPayload } from "../types";
import executeSaveChanges from "./executeSaveChanges";
import { registerListener } from "./registerListener";

export default function registerSaveChangesListener(
  server: ViteDevServer,
  fileManager: FileSystemManager,
  gitWrapper: GitWrapper,
  hmrManager: HmrManager
) {
  registerListener(
    server,
    MessageID.SaveChanges,
    async (saveData: SaveChangesPayload) => {
      await executeSaveChanges(saveData, fileManager, hmrManager, server);
      await reloadGitData(gitWrapper, server);
      return "Changes saved successfully.";
    }
  );
}
