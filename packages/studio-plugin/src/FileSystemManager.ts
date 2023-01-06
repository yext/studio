import { PageState, UserPaths } from "./types";
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

  getUserPaths() {
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

  async updateFile(filepath: string, data: PageState) {
    if (filepath.startsWith(this.paths.pages)) {
      if (!fs.existsSync(filepath)) {
        fs.openSync(filepath, "w");
      }
      return this.writer.writeToPageFile(
        path.basename(filepath, ".tsx"),
        data
      );
    } else {
      throw new Error(`Cannot update file: filepath "${filepath}" is not within the paths recognized by Studio.`)
    }
  }
}
