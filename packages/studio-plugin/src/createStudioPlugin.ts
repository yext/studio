import { ConfigEnv, HmrContext, Plugin } from "vite";
import getStudioConfig from "./parsers/getStudioConfig";
import ParsingOrchestrator, {
  createTsMorphProject,
} from "./ParsingOrchestrator";
import configureStudioServer from "./configureStudioServer";
import FileSystemManager from "./FileSystemManager";
import { FileSystemWriter } from "./writers/FileSystemWriter";
import { UserPaths } from "./types";
import { JsonImporter } from "./types/JsonImporter";

/**
 * Handles server-client communication.
 *
 * This includes providing a vite virtual module so that server side data can be passed to the front end
 * for the initial load, and messaging using the vite HMR API.
 */
export default async function createStudioPlugin(
  args: ConfigEnv,
  jsonImporter: JsonImporter
): Promise<Plugin> {
  const virtualModuleId = "virtual:yext-studio";
  const resolvedVirtualModuleId = "\0" + virtualModuleId;
  const pathToUserProjectRoot = process.cwd();
  const studioConfig = await getStudioConfig(pathToUserProjectRoot);

  /** The ts-morph Project instance for the entire app. */
  const tsMorphProject = createTsMorphProject();
  const orchestrator = new ParsingOrchestrator(
    tsMorphProject,
    studioConfig.paths,
    studioConfig.plugins,
    jsonImporter,
    studioConfig.isPagesJSRepo
  );
  let studioData = await orchestrator.getStudioData();

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
    resolveId(id) {
      if (id === virtualModuleId) {
        return resolvedVirtualModuleId;
      }
    },
    load(id) {
      if (id === resolvedVirtualModuleId) {
        return `export default ${JSON.stringify(studioData)}`;
      }
    },
    configureServer: (server) => {
      configureStudioServer(server, fileSystemManager);
    },
    async handleHotUpdate(ctx: HmrContext) {
      const { moduleGraph } = ctx.server;
      ctx.modules.forEach((m) => ctx.server.reloadModule(m));

      const studioDataModule = moduleGraph.getModuleById(
        resolvedVirtualModuleId
      );
      if (studioDataModule && ctx.file.startsWith(pathToUserProjectRoot)) {
        orchestrator.reloadFile(ctx.file);
        studioData = await orchestrator.getStudioData();
        moduleGraph.invalidateModule(studioDataModule);
      }
    },
  };
}
