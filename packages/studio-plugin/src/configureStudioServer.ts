import { ViteDevServer } from "vite";
import FileSystemManager from "./FileSystemManager";
import registerSaveChangesListener from "./messaging/registerSaveChangesListener";
import ParsingOrchestrator from "./ParsingOrchestrator";
import { UserPaths } from "./types";
import sendHMRUpdate from "./messaging/sendHMRUpdate";

/**
 * A factory method for our vite plugin's configureServer handler.
 */
export default function createConfigureStudioServer(
  fileSystemManager: FileSystemManager,
  orchestrator: ParsingOrchestrator,
  pathToUserProjectRoot: string,
  userPaths: UserPaths
) {
  /**
   * Sets up websocket listeners.
   */
  return function configureStudioServer(server: ViteDevServer) {
    registerSaveChangesListener(server, fileSystemManager);
    server.watcher.add(userPaths.components);
    server.watcher.add(userPaths.modules);
    server.watcher.add(userPaths.pages);
    server.watcher.on("unlink", (filepath) => {
      orchestrator.removeFile(filepath);
      const studioData = orchestrator.getStudioData();
      sendHMRUpdate(
        studioData,
        filepath,
        server,
        pathToUserProjectRoot,
        userPaths
      );
    });
    server.watcher.on("add", (filepath) => {
      orchestrator.reloadFile(filepath);
      const studioData = orchestrator.getStudioData();
      sendHMRUpdate(
        studioData,
        filepath,
        server,
        pathToUserProjectRoot,
        userPaths
      );
    });
  };
}
