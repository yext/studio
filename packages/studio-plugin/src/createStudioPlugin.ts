import { ConfigEnv, Plugin } from "vite";
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
/**
 * Handles server-client communication.
 *
 * This includes providing a vite virtual module so that server side data can be passed to the front end
 * for the initial load, and messaging using the vite HMR API.
 */
export default async function createStudioPlugin(
  args: ConfigEnv
): Promise<Plugin> {
  const getLocalDataMapping = (await import("./parsers/getLocalDataMapping"))
    .default;
  const pathToUserProjectRoot = process.cwd();
  const studioConfig = await getStudioConfig(pathToUserProjectRoot);
  const gitWrapper = new GitWrapper();
  await gitWrapper.refreshData();

  /** The ts-morph Project instance for the entire app. */
  const tsMorphProject = createTsMorphProject();
  const localDataMapping = studioConfig.isPagesJSRepo
    ? await getLocalDataMapping(studioConfig.paths.localData)
    : undefined;
  const orchestrator = new ParsingOrchestrator(
    tsMorphProject,
    studioConfig.paths,
    studioConfig.plugins,
    localDataMapping
  );
  const initialStudioData = orchestrator.getStudioData();

  const fileSystemManager = new FileSystemManager(
    studioConfig.paths,
    new FileSystemWriter(
      orchestrator,
      studioConfig.isPagesJSRepo,
      tsMorphProject
    )
  );

  // We have to use a dynamic import here - if we use a regular import,
  // Vite will import deps like react-dev-utils in the browser.
  // This causes an error to be thrown regarding `process` not being defined.
  const { default: openBrowser } = await import("react-dev-utils/openBrowser");
  const { readdirSync, existsSync, lstatSync } = await import("fs");
  const path = await import("path");

  return {
    name: "yext-studio-vite-plugin",
    async buildStart() {
      if (args.mode === "development" && args.command === "serve") {
        openBrowser("http://localhost:5173/");
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
    async resolveId(id) {
      if (id === VirtualModuleID.StudioData || id === VirtualModuleID.GitData) {
        return "\0" + id;
      }
    },
    load(id) {
      if (id === "\0" + VirtualModuleID.StudioData) {
        return `export default ${JSON.stringify(initialStudioData)}`;
      } else if (id === "\0" + VirtualModuleID.GitData) {
        return `export default ${JSON.stringify(gitWrapper.getStoredData())}`;
      }
    },
    configureServer: createConfigureStudioServer(fileSystemManager, gitWrapper),
    handleHotUpdate: createHandleHotUpdate(
      orchestrator,
      pathToUserProjectRoot,
      studioConfig.paths
    ),
  };
}
