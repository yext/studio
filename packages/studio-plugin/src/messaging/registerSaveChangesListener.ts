import { ViteDevServer } from "vite";
import FileSystemManager from "../FileSystemManager";
import { MessageID, SaveChangesPayload } from "../types";
import executeSaveChanges from "./executeSaveChanges";
import { registerListener } from "./registerListener";

export default function registerSaveChangesListener(
  server: ViteDevServer,
  fileManager: FileSystemManager
) {
  registerListener(
    server,
    MessageID.SaveChanges,
    async (saveData: SaveChangesPayload) => {
      await executeSaveChanges(saveData, fileManager);
      return "Changes saved successfully.";
    }
  );
}
