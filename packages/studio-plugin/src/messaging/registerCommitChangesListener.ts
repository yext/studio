import { ViteDevServer } from "vite";
import FileSystemManager from "../FileSystemManager";
import { FileMetadataKind, MessageID } from "../types";
import { registerListener } from "./registerListener";
import path from "path";

export default function registerCommitChangesListener(
  server: ViteDevServer,
  fileManager: FileSystemManager
) {
  registerListener(
    server,
    MessageID.StudioCommitChanges,
    async ({ pageNameToPageState, pendingChanges, UUIDToFileMetadata }) => {
      pendingChanges.pagesToRemove.forEach((pageToRemove) => {
        const filepath =
          path.join(fileManager.getUserPaths().pages, pageToRemove) + ".tsx";
        fileManager.removeFile(filepath);
      });
      pendingChanges.modulesToUpdate.forEach((moduleToUpdate) => {
        const metadata = UUIDToFileMetadata[moduleToUpdate];
        if (metadata.kind === FileMetadataKind.Module) {
          fileManager.updateModuleFile(metadata.filepath, metadata);
        }
      });
      await Promise.all(
        pendingChanges.pagesToUpdate.map(async (pageToUpdate) => {
          const filepath = pageNameToPageState[pageToUpdate]?.filepath;
          fileManager.updatePageFile(
            filepath,
            pageNameToPageState[pageToUpdate]
          );
        })
      );
      return "Changes saved successfully.";
    }
  );
}
