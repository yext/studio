import { ConfigEnv, Plugin } from "vite";
import openBrowser from "react-dev-utils/openBrowser.js";

/**
 * Handles server-client communication.
 *
 * This includes providing a vite virtual module so that server side data can be passed to the front end
 * for the initial load, and messaging using the vite HMR API.
 */
export default function createStudioPlugin(args: ConfigEnv): Plugin {
  const virtualModuleId = "virtual:yext-studio";
  const resolvedVirtualModuleId = "\0" + virtualModuleId;

  // TODO: pass actual data
  const ctx = "dummy studio data!";

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
        return `export default ${JSON.stringify(ctx)}`;
      }
    },
  };
}

