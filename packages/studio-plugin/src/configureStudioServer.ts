import { ViteDevServer } from "vite";
import FileSystemManager from "./FileSystemManager";
import registerSaveChangesListener from "./messaging/registerSaveChangesListener";

export default function createConfigureStudioServer(
  fileSystemManager: FileSystemManager
) {
  return function configureStudioServer(server: ViteDevServer) {
    registerSaveChangesListener(server, fileSystemManager);
  };
}
