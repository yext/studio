import { ViteDevServer } from "vite";
import FileSystemManager from "./FileSystemManager";
import GitWrapper from "./git/GitWrapper";
import registerDeployListener from "./messaging/registerDeployListener";
import registerSaveChangesListener from "./messaging/registerSaveChangesListener";
import ParsingOrchestrator from "./ParsingOrchestrator";
import registerGenerateTestData from "./messaging/registerGenerateTestData";
import LocalDataMappingManager from "./LocalDataMappingManager";
import HmrManager from "./HmrManager";
import { UserPaths } from "./types";

/**
 * A factory method for our vite plugin's configureServer handler.
 */
export default function createConfigureStudioServer(
  fileSystemManager: FileSystemManager,
  gitWrapper: GitWrapper,
  orchestrator: ParsingOrchestrator,
  localDataMappingManager: LocalDataMappingManager | undefined,
  pathToUserProjectRoot: string,
  userPaths: UserPaths
) {
  /**
   * Sets up websocket listeners.
   */
  return function configureStudioServer(server: ViteDevServer) {
    const hmrManager = new HmrManager(server, orchestrator, userPaths);
    hmrManager.createWatcher(pathToUserProjectRoot);

    registerSaveChangesListener(
      server,
      fileSystemManager,
      gitWrapper,
      orchestrator
    );
    registerDeployListener(server, fileSystemManager, gitWrapper, orchestrator);
    localDataMappingManager &&
      registerGenerateTestData(server, localDataMappingManager);
  };
}
