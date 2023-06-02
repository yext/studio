import {
  ConfigEnv,
  defineConfig,
  PluginOption,
  searchForWorkspaceRoot,
  UserConfig,
} from "vite";
import createStudioPlugin from "@yext/studio-plugin/src/createStudioPlugin";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";

export default defineConfig((args: ConfigEnv): UserConfig => {
  return {
    root: __dirname,
    server: {
      host: "0.0.0.0",
      fs: {
        allow: [
          searchForWorkspaceRoot(process.cwd()),
          process.cwd(),
          __dirname,
        ],
      },
    },
    build: {
      rollupOptions: {
        input: ["index.html", "src/store/useStudioStore.ts"],
      },
    },
    plugins: [react(), createStudioPlugin(args), svgr() as PluginOption],
    css: {
      postcss: __dirname,
    },
  };
});
