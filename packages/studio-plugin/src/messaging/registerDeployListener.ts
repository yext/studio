import { ViteDevServer } from "vite";
import { MessageID, SaveChangesPayload } from "../types";
import { registerListener } from "./registerListener";
import { simpleGit, SimpleGit } from "simple-git";
import executeSaveChanges from "./executeSaveChanges";
import FileSystemManager from "../FileSystemManager";

export default function registerDeployListener(
  server: ViteDevServer,
  fileManager: FileSystemManager
) {
  const git: SimpleGit = simpleGit();
  registerListener(
    server,
    MessageID.Deploy,
    async (saveData: SaveChangesPayload) => {
      await executeSaveChanges(saveData, fileManager);
      await git.add("-A");
      await git.commit("Yext Studio Commit");
      await git.push();
      return {
        msg: "Deployed successfully."
      };
    }
  );
}
