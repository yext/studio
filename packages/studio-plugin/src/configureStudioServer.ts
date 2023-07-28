import { ViteDevServer } from "vite";
import FileSystemManager from "./FileSystemManager";
import GitWrapper from "./git/GitWrapper";
import registerDeployListener from "./messaging/registerDeployListener";
import registerSaveChangesListener from "./messaging/registerSaveChangesListener";
import ParsingOrchestrator from "./ParsingOrchestrator";
import registerGenerateTestData from "./messaging/registerGenerateTestData";

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
    registerGenerateTestData(server);
  };
}
