import { ViteDevServer } from "vite";
import FileSystemManager from "./FileSystemManager";
import GitWrapper from "./git/GitWrapper";
import registerDeployListener from "./messaging/registerDeployListener";
import registerSaveChangesListener from "./messaging/registerSaveChangesListener";
import ParsingOrchestrator from "./ParsingOrchestrator";
import registerGenerateTestData from "./messaging/registerGenerateTestData";
import LocalDataMappingManager from "./LocalDataMappingManager";
import registerWriteFileListener from "./messaging/registerWriteFileListener";
import registerGetComponentFile from "./messaging/registerGetComponentFile"
import registerGetAllComponentFilepaths from "./messaging/registerGetAllComponentFilepaths"
import registerGetCodeCompletionListener from "./messaging/registerGetCodeCompletionListener"
import registerGetTextGenerationListerner from "./messaging/registerGetTextGenerationListener"

/**
 * A factory method for our vite plugin's configureServer handler.
 */
export default function createConfigureStudioServer(
  fileSystemManager: FileSystemManager,
  gitWrapper: GitWrapper,
  orchestrator: ParsingOrchestrator,
  localDataMappingManager: LocalDataMappingManager
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
    registerGenerateTestData(server, localDataMappingManager);
    registerWriteFileListener(server,fileSystemManager);
    registerGetComponentFile(server,fileSystemManager);
    registerGetAllComponentFilepaths(server,fileSystemManager);
    registerGetCodeCompletionListener(server)
    registerGetTextGenerationListerner(server)
  };
}
