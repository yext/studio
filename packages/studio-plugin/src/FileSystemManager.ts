import {
  ModuleMetadata,
  PageState,
  SiteSettingsValues,
  UserPaths,
} from "./types";
import fs from "fs";
import path from "path";
import { Project } from "ts-morph";
import { FileSystemWriter } from "./writers/FileSystemWriter";

/**
 * Handles file removal and content update in user's repo
 * based on updated state from Studio's client side.
 */
export default class FileSystemManager {
  constructor(
    private project: Project,
    private paths: UserPaths,
    private writer: FileSystemWriter
  ) {}

  getUserPaths(): UserPaths {
    return this.paths;
  }

  removeFile(filepath: string) {
    if (fs.existsSync(filepath)) {
      const sourceFile = this.project.getSourceFile(filepath);
      if (sourceFile) {
        this.project.removeSourceFile(sourceFile);
      }
      fs.rmSync(filepath);
    }
  }

  async updatePageFile(filepath: string, pageState: PageState): Promise<void> {
    if (filepath.startsWith(this.paths.pages)) {
      FileSystemManager.openFile(filepath);
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
      FileSystemManager.openFile(filepath);
      return this.writer.writeToModuleFile(filepath, moduleMetadata);
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

  private static openFile(filepath: string) {
    if (!fs.existsSync(filepath)) {
      fs.openSync(filepath, "w");
    }
  }
}
