import { ConfigEnv, defineConfig, PluginOption, UserConfig } from "vite";
import createStudioPlugin from "@yext/studio-plugin";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";

export default defineConfig(async (args: ConfigEnv): Promise<UserConfig> => {
  return {
    root: __dirname,
    build: {
      rollupOptions: {
        input: ["index.html", "src/store/useStudioStore.ts"]
      }
    },
    plugins: [react(), createStudioPlugin(args), svgr() as PluginOption],
    css: {
      postcss: __dirname,
    },
  };
});
