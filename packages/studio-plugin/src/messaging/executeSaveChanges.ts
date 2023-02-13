import FileSystemManager from "../FileSystemManager";
import { FileMetadataKind, SaveChangesPayload } from "../types";
import path from "path";
import HmrManager from "../HmrManager";
import { ViteDevServer } from "vite"
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
  pendingChanges.pagesToRemove.forEach((pageToRemove) => {
    const filepath =
      path.join(fileManager.getUserPaths().pages, pageToRemove) + ".tsx";
    fileManager.removeFile(filepath);
    hmrManager.reloadFile(filepath);
  });
  pendingChanges.modulesToUpdate.forEach((moduleUUID) => {
    const metadata = UUIDToFileMetadata[moduleUUID];
    if (metadata.kind === FileMetadataKind.Module) {
      fileManager.updateModuleFile(metadata.filepath, metadata);
    }
    hmrManager.reloadFile(metadata.filepath);
  });
  pendingChanges.pagesToUpdate.forEach((pageToUpdate) => {
    const filepath = pageNameToPageState[pageToUpdate]?.filepath;
    fileManager.updatePageFile(filepath, pageNameToPageState[pageToUpdate]);
    hmrManager.reloadFile(filepath);
  });
  if (siteSettings?.values) {
    fileManager.updateSiteSettings(siteSettings.values);
  }
  fileManager.syncFileMetadata(UUIDToFileMetadata);
  hmrManager.resumeHMR();
  await hmrManager.sendFullUpdate(server);
}
