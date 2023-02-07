import { ViteDevServer } from "vite";
import { MessageID, SaveChangesPayload } from "../types";
import { registerListener } from "./registerListener";
import { simpleGit as simpleGitFactory, SimpleGit } from 'simple-git';
import handleSaveChanges from "./handleSaveChanges";
import FileSystemManager from "../FileSystemManager";

export default function registerDeployListener(
  server: ViteDevServer,
  fileManager: FileSystemManager
) {
  const git: SimpleGit = simpleGitFactory();
  registerListener(
    server,
    MessageID.Deploy,
    async (saveData: SaveChangesPayload) => {
      await handleSaveChanges(saveData, fileManager);
      await git.add('-A');
      await git.commit("Yext Studio Commit");
      await git.push();
      return "Deployed successfully.";
    }
  );
}
