import { ViteDevServer } from "vite";
import FileSystemManager from "./FileSystemManager";
import GitWrapper from "./git/GitWrapper";
import HmrManager from "./HmrManager";
import registerDeployListener from "./messaging/registerDeployListener";
import registerSaveChangesListener from "./messaging/registerSaveChangesListener";

/**
 * A factory method for our vite plugin's configureServer handler.
 */
export default function createConfigureStudioServer(
  fileSystemManager: FileSystemManager,
  gitWrapper: GitWrapper,
  hmrManager: HmrManager
) {
  /**
   * Sets up websocket listeners.
   */
  return function configureStudioServer(server: ViteDevServer) {
    registerSaveChangesListener(
      server,
      fileSystemManager,
      gitWrapper,
      hmrManager
    );
    registerDeployListener(server, fileSystemManager, gitWrapper, hmrManager);
  };
}
