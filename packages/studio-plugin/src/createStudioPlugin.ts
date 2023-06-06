import { ConfigEnv, Plugin } from "vite";
import { simpleGit } from "simple-git";
import getStudioConfig from "./parsers/getStudioConfig";
import ParsingOrchestrator, {
  createTsMorphProject,
} from "./ParsingOrchestrator";
import FileSystemManager from "./FileSystemManager";
import { FileSystemWriter } from "./writers/FileSystemWriter";
import { UserPaths } from "./types";
import createHandleHotUpdate from "./handleHotUpdate";
import createConfigureStudioServer from "./configureStudioServer";
import GitWrapper from "./git/GitWrapper";
import VirtualModuleID from "./VirtualModuleID";
import HmrManager from "./HmrManager";
import getLocalDataMapping from "./parsers/getLocalDataMapping";
import openBrowser from "react-dev-utils/openBrowser";
import { readdirSync, existsSync, lstatSync } from "fs";
import path from "path";
import lodash from "lodash";
import { UserConfig } from "vite";

/**
 * Handles server-client communication.
 *
 * This includes providing a vite virtual module so that server side data can be passed to the front end
 * for the initial load, and messaging using the vite HMR API.
 */
export default async function createStudioPlugin(
  args: ConfigEnv
): Promise<Plugin> {
  const pathToUserProjectRoot = process.cwd();

  const studioConfig = await getStudioConfig(pathToUserProjectRoot);
  const gitWrapper = new GitWrapper(simpleGit());
  await gitWrapper.test();
  await gitWrapper.refreshData();

  /** The ts-morph Project instance for the entire app. */
  const tsMorphProject = createTsMorphProject();
  const localDataMapping = studioConfig.isPagesJSRepo
    ? await getLocalDataMapping(studioConfig.paths.localData)
    : undefined;
  const orchestrator = new ParsingOrchestrator(
    tsMorphProject,
    studioConfig,
    localDataMapping
  );
  const hmrManager = new HmrManager(
    orchestrator,
    pathToUserProjectRoot,
    studioConfig.paths
  );

  const fileSystemManager = new FileSystemManager(
    studioConfig.paths,
    new FileSystemWriter(orchestrator, tsMorphProject)
  );

  return {
    name: "yext-studio-vite-plugin",
    buildStart() {
      if (args.mode === "development" && args.command === "serve") {
        openBrowser(`http://localhost:${studioConfig.port}/`);
      }
      const watchDir = (dirPath: string) => {
        if (existsSync(dirPath)) {
          readdirSync(dirPath).forEach((filename) => {
            const filepath = path.join(dirPath, filename);
            if (lstatSync(filepath).isDirectory()) {
              watchDir(filepath);
            } else {
              this.addWatchFile(filepath);
            }
          });
        }
      };
      const watchUserFiles = (userPaths: UserPaths) => {
        watchDir(userPaths.pages);
        watchDir(userPaths.components);
        watchDir(userPaths.modules);
        this.addWatchFile(userPaths.siteSettings);
      };
      watchUserFiles(studioConfig.paths);
    },
    config(config) {
      const serverConfig: UserConfig = {
        server: {
          port: studioConfig.port,
          strictPort: true,
        },
      };
      return lodash.merge({}, config, serverConfig);
    },
    resolveId(id) {
      if (id === VirtualModuleID.StudioData || id === VirtualModuleID.GitData) {
        return "\0" + id;
      }
    },
    load(id) {
      if (id === "\0" + VirtualModuleID.StudioData) {
        return `export default ${JSON.stringify(orchestrator.getStudioData())}`;
      } else if (id === "\0" + VirtualModuleID.GitData) {
        return `export default ${JSON.stringify(gitWrapper.getStoredData())}`;
      }
    },
    configureServer: createConfigureStudioServer(
      fileSystemManager,
      gitWrapper,
      orchestrator
    ),
    handleHotUpdate: createHandleHotUpdate(hmrManager),
  };
}
