import { ViteDevServer } from "vite";
import FileSystemManager from "../FileSystemManager";
import { MessageID } from "../types";
import { registerListener } from "./registerListener";
import path from "path";

export default function registerCommitChangesListener(
  server: ViteDevServer,
  fileManager: FileSystemManager
  ) {
  registerListener(server, MessageID.StudioCommitChanges, async ({
    pageNameToPageState,
    pendingChanges,
  }) => {
    pendingChanges.pagesToRemove.forEach((pageToRemove) => {
      const filepath = path.join(fileManager.getUserPaths().pages, pageToRemove) + ".tsx";
      fileManager.removeFile(filepath);
    });
    await Promise.all(
      pendingChanges.pagesToUpdate.map(async (pageToUpdate) => {
        const filepath = pageNameToPageState[pageToUpdate]?.filepath;
        fileManager.updateFile(filepath, pageNameToPageState[pageToUpdate])
      })
    );
    return "Changes saved successfully.";
  });
}
