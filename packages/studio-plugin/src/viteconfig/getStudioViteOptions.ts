import { CSSOptions, ConfigEnv, ServerOptions, UserConfig } from "vite";
import { StudioConfigWithDefaulting } from "../types";
import tailwindcss from "tailwindcss";
import autoprefixer from "autoprefixer";
import generateTailwindConfig from "./generateTailwindConfig";

export default function getStudioViteOptions(
  args: ConfigEnv,
  studioConfig: StudioConfigWithDefaulting,
  pathToUserProjectRoot: string,
  excludeFromWatch: (filepath: string) => boolean
): UserConfig {
  const serverOptions: ServerOptions = {
    port: studioConfig.port,
    open:
      args.mode === "development" &&
      args.command === "serve" &&
      studioConfig.openBrowser,
    watch: {
      ignored: excludeFromWatch,
    },
  };

  const tailwindConfig = generateTailwindConfig(pathToUserProjectRoot);
  const cssOptions: CSSOptions = {
    postcss: {
      plugins: [autoprefixer(), tailwindcss(tailwindConfig)],
    },
  };

  return {
    server: serverOptions,
    css: cssOptions,
  };
}
