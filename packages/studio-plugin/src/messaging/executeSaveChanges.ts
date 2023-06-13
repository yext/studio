import FileSystemManager from "../FileSystemManager.js";
import { SaveChangesPayload } from "../types/index.js";
import path from "path";
import ParsingOrchestrator from "../ParsingOrchestrator.js";

export default function executeSaveChanges(
  saveData: SaveChangesPayload,
  fileManager: FileSystemManager,
  orchestrator: ParsingOrchestrator
) {
  const {
    pageNameToPageState,
    pendingChanges,
    UUIDToFileMetadata,
    siteSettings,
  } = saveData;
  fileManager.syncFileMetadata(UUIDToFileMetadata);
  pendingChanges.pagesToRemove.forEach((pageToRemove) => {
    const filepath =
      path.join(fileManager.getUserPaths().pages, pageToRemove) + ".tsx";
    fileManager.removeFile(filepath);
    orchestrator.reloadFile(filepath);
  });
  pendingChanges.pagesToUpdate.forEach((pageToUpdate) => {
    const filepath = pageNameToPageState[pageToUpdate]?.filepath;
    fileManager.updatePageFile(filepath, pageNameToPageState[pageToUpdate]);
    orchestrator.reloadFile(filepath);
  });
  if (siteSettings?.values) {
    fileManager.updateSiteSettings(siteSettings.values);
  }
}
