import { ViteDevServer } from "vite";
import FileSystemManager from "./FileSystemManager";
import registerSaveChangesListener from "./messaging/registerSaveChangesListener";
import sendHMRUpdate from "./messaging/sendHMRUpdate";

/**
 * A factory method for our vite plugin's configureServer handler.
 */
export default function createConfigureStudioServer(
  fileSystemManager: FileSystemManager
) {
  /**
   * Sets up websocket listeners.
   */
  return function configureStudioServer(server: ViteDevServer) {
    registerSaveChangesListener(server, fileSystemManager);
  };
}
