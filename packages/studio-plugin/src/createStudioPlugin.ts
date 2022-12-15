import { ConfigEnv, Plugin } from "vite";
import openBrowser from "react-dev-utils/openBrowser.js";
import ParsingOrchestrator from "./ParsingOrchestrator";
import path from "path";
import getStudioPaths from "./parsers/getStudioPaths";

/**
 * Handles server-client communication.
 *
 * This includes providing a vite virtual module so that server side data can be passed to the front end
 * for the initial load, and messaging using the vite HMR API.
 */
export default function createStudioPlugin(args: ConfigEnv): Plugin {
  const virtualModuleId = "virtual:yext-studio";
  const resolvedVirtualModuleId = "\0" + virtualModuleId;
  const pathToUserSrc = path.join(process.cwd(), "src");
  const studioPaths = getStudioPaths(pathToUserSrc);
  const orchestrator = new ParsingOrchestrator(studioPaths);
  const studioData = orchestrator.getStudioData();

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
