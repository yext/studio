import { ConfigEnv, ServerOptions, UserConfig } from "vite";
import { StudioConfigWithDefaulting } from "../types";

export default function getStudioViteOptions(
  args: ConfigEnv,
  studioConfig: StudioConfigWithDefaulting,
  pathToUserProjectRoot: string
): UserConfig {
  const serverOptions: ServerOptions = {
    port: studioConfig.port,
    open:
      args.mode === "development" &&
      args.command === "serve" &&
      studioConfig.openBrowser,
    watch: {
      ignored: pathToUserProjectRoot,
    },
  };

  return {
    server: serverOptions,
  };
}
