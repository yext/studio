import { ViteDevServer } from "vite";
import FileSystemManager from "../FileSystemManager";
import { FileMetadataKind, MessageID } from "../types";
import { registerListener } from "./registerListener";
import path from "path";

export default function registerSaveChangesListener(
  server: ViteDevServer,
  fileManager: FileSystemManager
) {
  registerListener(
    server,
    MessageID.SaveChanges,
    async ({
      pageNameToPageState,
      pendingChanges,
      UUIDToFileMetadata,
      siteSettings,
    }) => {
      pendingChanges.pagesToRemove.forEach((pageToRemove) => {
        const filepath =
          path.join(fileManager.getUserPaths().pages, pageToRemove) + ".tsx";
        fileManager.removeFile(filepath);
      });
      pendingChanges.modulesToUpdate.forEach((moduleUUID) => {
        const metadata = UUIDToFileMetadata[moduleUUID];
        if (metadata.kind === FileMetadataKind.Module) {
          fileManager.updateModuleFile(metadata.filepath, metadata);
        }
      });
      await Promise.all(
        pendingChanges.pagesToUpdate.map(async (pageToUpdate) => {
          const filepath = pageNameToPageState[pageToUpdate]?.filepath;
          await fileManager.updatePageFile(
            filepath,
            pageNameToPageState[pageToUpdate]
          );
        })
      );
      if (siteSettings?.values) {
        fileManager.updateSiteSettings(siteSettings.values);
      }
      fileManager.syncFileMetadata(UUIDToFileMetadata);

      return "Changes saved successfully.";
    }
  );
}
