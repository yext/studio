import { UserPaths } from "./types";
import fs from "fs";
import path from "path";

export default class FileWatchOrchestrator {
  constructor(
    private addWatchFile: (filepath: string) => void,
    private handleRemoveFile: (filepath: string) => void
  ) {}

  watchUserFiles(userPaths: UserPaths) {
    [userPaths.pages, userPaths.components, userPaths.modules].forEach(
      this.watchPath
    );
    this.addWatchFile(userPaths.siteSettings);
  }

  private watchPath = (filepath: string) => {
    if (!fs.existsSync(filepath)) {
      return;
    }
    if (fs.lstatSync(filepath).isDirectory()) {
      fs.readdirSync(filepath).forEach((filename) => {
        this.watchPath(path.join(filepath, filename));
      });
      this.watchDirForRenameEvents(filepath);
    } else {
      this.addWatchFile(filepath);
    }
  };

  /**
   * Watches the directory for rename events, which encompass
   * file deletions and additions.
   *
   * The chokidar library would be preferable over fs.watch here,
   * but is currently not capable of running within vite due to its
   * usage of .node files.
   */
  private watchDirForRenameEvents = (dirpath: string) => {
    fs.watch(dirpath, (event, filename) => {
      if (event !== "rename") {
        return;
      }
      if (!filename) {
        console.error("No filename provided by fs.watch.");
        return;
      }
      const filepath = path.join(dirpath, filename);
      if (fs.existsSync(filepath)) {
        console.log(
          "fs.watch add",
          dirpath,
          event,
          filename,
          fs.lstatSync(filepath).isDirectory()
        );
        this.watchPath(filepath);
      } else {
        console.log("fs.watch remove", dirpath, event, filename);
        this.handleRemoveFile(filepath);
      }
    });
  };
}
