import { ViteDevServer } from "vite";
import FileSystemManager from "./FileSystemManager";
import registerCommitChangesListener from "./messaging/registerCommitChangesListener";

export default function configureStudioServer(
  server: ViteDevServer,
  fileSystemManager: FileSystemManager
) {
  registerCommitChangesListener(server, fileSystemManager);
}
