import { ViteDevServer } from "vite";
import FileSystemManager from "./FileSystemManager";
import FileWatchOrchestrator from "./FileWatchOrchestrator";
import registerSaveChangesListener from "./messaging/registerSaveChangesListener";
import sendHMRUpdate from "./messaging/sendHMRUpdate";
import ParsingOrchestrator from "./ParsingOrchestrator";
import { UserPaths } from "./types";
import path from 'path'

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
    server.watcher.add(path.join(userPaths.components))
    
    server.watcher.on('add', (addedPath, stats) => {
      console.log(addedPath, stats)
    })
    // new FileWatchOrchestrator(
    //   (filepath: string) => {
    //     server.watcher.add(filepath);
    //     orchestrator.reloadFile(filepath);
    //     const studioData = orchestrator.getStudioData()
    //     sendHMRUpdate(studioData, filepath, server.ws, pathToUserProjectRoot, userPaths)
    //   },
    //   (filepath: string) => {
    //     server.watcher.unwatch(filepath);
    //     orchestrator.removeFile(filepath);
    //     const studioData = orchestrator.getStudioData()
    //     sendHMRUpdate(studioData, filepath, server.ws, pathToUserProjectRoot, userPaths)
    //   },
    // ).watchUserFiles(userPaths);
  };
}
