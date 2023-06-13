import { ViteDevServer } from "vite";
import FileSystemManager from "./FileSystemManager.js";
import GitWrapper from "./git/GitWrapper.js";
import registerDeployListener from "./messaging/registerDeployListener.js";
import registerSaveChangesListener from "./messaging/registerSaveChangesListener.js";
import ParsingOrchestrator from "./ParsingOrchestrator.js";

/**
 * A factory method for our vite plugin's configureServer handler.
 */
export default function createConfigureStudioServer(
  fileSystemManager: FileSystemManager,
  gitWrapper: GitWrapper,
  orchestrator: ParsingOrchestrator
) {
  /**
   * Sets up websocket listeners.
   */
  return function configureStudioServer(server: ViteDevServer) {
    registerSaveChangesListener(
      server,
      fileSystemManager,
      gitWrapper,
      orchestrator
    );
    registerDeployListener(server, fileSystemManager, gitWrapper, orchestrator);
  };
}
