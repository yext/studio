import { ConfigEnv, Plugin } from "vite";
import getStudioConfig from "./parsers/getStudioConfig";
import ParsingOrchestrator, {
  createTsMorphProject,
} from "./ParsingOrchestrator";
import FileSystemManager from "./FileSystemManager";
import { FileSystemWriter } from "./writers/FileSystemWriter";
import createHandleHotUpdate from "./handleHotUpdate";
import createConfigureStudioServer from "./configureStudioServer";

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
  const virtualModuleId = "virtual:yext-studio";
  const resolvedVirtualModuleId = "\0" + virtualModuleId;
  const pathToUserProjectRoot = process.cwd();
  const studioConfig = await getStudioConfig(pathToUserProjectRoot);

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

  return {
    name: "yext-studio-vite-plugin",
    buildStart() {
      if (args.mode === "development" && args.command === "serve") {
        openBrowser("http://localhost:5173/");
      }
    },
    resolveId(id) {
      if (id === virtualModuleId) {
        return resolvedVirtualModuleId;
      }
    },
    load(id) {
      if (id === resolvedVirtualModuleId) {
        return `export default ${JSON.stringify(initialStudioData)}`;
      }
    },
    configureServer: createConfigureStudioServer(
      fileSystemManager,
      orchestrator,
      pathToUserProjectRoot,
      studioConfig.paths
    ),
    handleHotUpdate: createHandleHotUpdate(
      orchestrator,
      pathToUserProjectRoot,
      studioConfig.paths
    ),
  };
}
