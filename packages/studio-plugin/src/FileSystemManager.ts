import {
  FileMetadata,
  ModuleMetadata,
  PageState,
  SiteSettingsValues,
  UserPaths,
} from "./types";
import fs from "fs";
import path from "path";
import { FileSystemWriter } from "./writers/FileSystemWriter";

/**
 * Handles file removal and content update in user's repo
 * based on updated state from Studio's client side.
 */
export default class FileSystemManager {
  constructor(private paths: UserPaths, private writer: FileSystemWriter) {}

  removeFile(filepath: string) {
    this.writer.removeFile(filepath);
  }

  getUserPaths(): UserPaths {
    return this.paths;
  }

  updatePageFile(filepath: string, pageState: PageState): void {
    if (filepath.startsWith(this.paths.pages)) {
      FileSystemWriter.openFile(filepath);
      return this.writer.writeToPageFile(
        path.basename(filepath, ".tsx"),
        pageState
      );
    } else {
      throw new Error(
        `Cannot update page file: filepath "${filepath}" is not within the` +
          ` expected path for pages "${this.paths.pages}".`
      );
    }
  }

  updateModuleFile(filepath: string, moduleMetadata: ModuleMetadata) {
    if (filepath.startsWith(this.paths.modules)) {
    } else {
      throw new Error(
        `Cannot update module file: filepath "${filepath}" is not within the` +
          ` expected path for modules "${this.paths.modules}".`
      );
    }
  }

  updateSiteSettings(siteSettingsValues: SiteSettingsValues) {
    this.writer.writeToSiteSettings(siteSettingsValues);
  }

  syncFileMetadata(UUIDToFileMetadata: Record<string, FileMetadata>) {
    this.writer.syncFileMetadata(UUIDToFileMetadata);
  }
}
