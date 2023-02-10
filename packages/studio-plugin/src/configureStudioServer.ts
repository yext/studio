import { ViteDevServer } from "vite";
import FileSystemManager from "./FileSystemManager";
import GitWrapper from "./git/GitWrapper";
import registerDeployListener from "./messaging/registerDeployListener";
import registerSaveChangesListener from "./messaging/registerSaveChangesListener";

/**
 * A factory method for our vite plugin's configureServer handler.
 */
export default function createConfigureStudioServer(
  fileSystemManager: FileSystemManager,
  gitWrapper: GitWrapper
) {
  /**
   * Sets up websocket listeners.
   */
  return function configureStudioServer(server: ViteDevServer) {
    registerSaveChangesListener(server, fileSystemManager, gitWrapper);
    registerDeployListener(server, fileSystemManager, gitWrapper);
  };
}
