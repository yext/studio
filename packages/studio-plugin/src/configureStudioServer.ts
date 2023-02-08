import { ViteDevServer } from "vite";
import FileSystemManager from "./FileSystemManager";
import registerSaveChangesListener from "./messaging/registerSaveChangesListener";

export default function configureStudioServer(
  server: ViteDevServer,
  fileSystemManager: FileSystemManager
) {
  registerSaveChangesListener(server, fileSystemManager);
}
