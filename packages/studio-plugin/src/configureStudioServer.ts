import { ViteDevServer } from "vite";
import FileSystemManager from "./FileSystemManager";
import GitWrapper from "./git/GitWrapper";
import registerDeployListener from "./messaging/registerDeployListener";
import registerSaveChangesListener from "./messaging/registerSaveChangesListener";
import ParsingOrchestrator from "./ParsingOrchestrator";
import registerRegenerateTestData from "./messaging/registerRegenerateTestData";

/**
 * A factory method for our vite plugin's configureServer handler.
 */
export default function createConfigureStudioServer(
  fileSystemManager: FileSystemManager,
  gitWrapper: GitWrapper,
  orchestrator: ParsingOrchestrator,
  pathToUserProjectRoot: string
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
    registerRegenerateTestData(server, pathToUserProjectRoot);
  };
}
