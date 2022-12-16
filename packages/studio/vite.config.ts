import { ConfigEnv, defineConfig, PluginOption } from "vite";
import createStudioPlugin from "@yext/studio-plugin";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";

export default defineConfig(async (args: ConfigEnv) => {
  return {
    root: __dirname,
    plugins: [react(), createStudioPlugin(args), svgr() as PluginOption],
    css: {
      postcss: __dirname,
    },
  };
});
