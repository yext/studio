import FileSystemManager from "../FileSystemManager";
import { FileMetadataKind, SaveChangesPayload } from "../types";
import path from "path";
import HmrManager from "../HmrManager";
import { ViteDevServer } from "vite";
import ParsingOrchestrator from "../ParsingOrchestrator";

export default async function executeSaveChanges(
  saveData: SaveChangesPayload,
  fileManager: FileSystemManager,
  hmrManager: HmrManager,
  server: ViteDevServer
) {
  const {
    pageNameToPageState,
    pendingChanges,
    UUIDToFileMetadata,
    siteSettings,
  } = saveData;
  hmrManager.pauseHMR();
  fileManager.syncFileMetadata(UUIDToFileMetadata);
  pendingChanges.pagesToRemove.forEach((pageToRemove) => {
    const filepath =
      path.join(fileManager.getUserPaths().pages, pageToRemove) + ".tsx";
    fileManager.removeFile(filepath);
    hmrManager.reloadFile(filepath);
  });
  pendingChanges.pagesToUpdate.forEach((pageToUpdate) => {
    const filepath = pageNameToPageState[pageToUpdate]?.filepath;
    fileManager.updatePageFile(filepath, pageNameToPageState[pageToUpdate]);
    hmrManager.reloadFile(filepath);
  });
  if (siteSettings?.values) {
    fileManager.updateSiteSettings(siteSettings.values);
  }
  hmrManager.resumeHMR();
  await hmrManager.sendFullUpdate(server);
}
