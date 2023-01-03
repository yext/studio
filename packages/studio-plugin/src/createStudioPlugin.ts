import { ConfigEnv, Plugin } from "vite";
import ParsingOrchestrator from "./ParsingOrchestrator";
import getUserPaths from "./parsers/getUserPaths";

/**
 * Handles server-client communication.
 *
 * This includes providing a vite virtual module so that server side data can be passed to the front end
 * for the initial load, and messaging using the vite HMR API.
 */
export default async function createStudioPlugin(
  args: ConfigEnv
): Promise<Plugin> {
  const virtualModuleId = "virtual:yext-studio";
  const resolvedVirtualModuleId = "\0" + virtualModuleId;
  const pathToUserProjectRoot = process.cwd();
  const userPaths = getUserPaths(pathToUserProjectRoot);
  const orchestrator = new ParsingOrchestrator(userPaths);
  const studioData = orchestrator.getStudioData();

  // We have to use a dynamic import here - if we use a regular import,
  // Vite will import react-dev-utils in the browser.
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
        return `export default ${JSON.stringify(studioData)}`;
      }
    },
  };
}
