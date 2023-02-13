import FileSystemManager from "../FileSystemManager";
import { FileMetadataKind, SaveChangesPayload } from "../types";
import path from "path";

export default function executeSaveChanges(
  saveData: SaveChangesPayload,
  fileManager: FileSystemManager
) {
  const {
    pageNameToPageState,
    pendingChanges,
    UUIDToFileMetadata,
    siteSettings,
  } = saveData;

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
  pendingChanges.pagesToUpdate.forEach((pageToUpdate) => {
    const filepath = pageNameToPageState[pageToUpdate]?.filepath;
    fileManager.updatePageFile(filepath, pageNameToPageState[pageToUpdate]);
  });
  if (siteSettings?.values) {
    fileManager.updateSiteSettings(siteSettings.values);
  }
  fileManager.syncFileMetadata(UUIDToFileMetadata);
}
