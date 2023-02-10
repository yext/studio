import { ViteDevServer } from "vite";
import { MessageID, SaveChangesPayload } from "../types";
import { registerListener } from "./registerListener";
import executeSaveChanges from "./executeSaveChanges";
import FileSystemManager from "../FileSystemManager";
import GitWrapper from "../git/GitWrapper";

export default function registerDeployListener(
  server: ViteDevServer,
  fileManager: FileSystemManager
) {
  registerListener(
    server,
    MessageID.Deploy,
    async (saveData: SaveChangesPayload) => {
      await executeSaveChanges(saveData, fileManager);
      await GitWrapper.deploy();
      return {
        msg: "Deployed successfully."
      };
    }
  );
}
