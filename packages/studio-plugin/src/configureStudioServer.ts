import { ViteDevServer } from "vite";
import FileSystemManager from "./FileSystemManager";
import registerCommitChangesListener from "./messaging/registerCommitChangesListener";

export default function createConfigureStudioServer(fileSystemManager: FileSystemManager) {
  return function configureStudioServer(server: ViteDevServer) {
    registerCommitChangesListener(server, fileSystemManager);
  }
}
