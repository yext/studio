import { CommitChangesEventPayload, UserPaths } from "./types";
import fs from "fs";
import path from "path"
import { Project } from "ts-morph";
import { FileSystemWriter } from "./writers/FileSystemWriter";

/**
 * Handles file removal and content modification in user's repo.
 */
export default class FileSystemManager {
  constructor(
    private project: Project,
    private paths: UserPaths,
    private writer: FileSystemWriter
  ) {}

  private removeFile(filepath: string) {
    if (fs.existsSync(filepath)) {
      const sourceFile = this.project.getSourceFile(filepath)
      if (sourceFile) {
        this.project.removeSourceFile(sourceFile)
      }
      fs.rmSync(filepath)
    }
  }

  async updateFileSystem({ pageNameToPageState, pendingChanges }: CommitChangesEventPayload): Promise<void> {
    pendingChanges.pagesToRemove.forEach(pageToRemove => {
      const filepath = path.join(this.paths.pages, pageToRemove) + ".tsx"
      this.removeFile(filepath)
    })
    await Promise.all(pendingChanges.pagesToUpdate.map(async (pageToUpdate) => {
      const filepath = pageNameToPageState[pageToUpdate]?.filepath
      if (!fs.existsSync(filepath)) {
        fs.openSync(filepath, 'w');
      }
      await this.writer.writeToPageFile(pageToUpdate, pageNameToPageState[pageToUpdate])
    }));
  }
 }
 