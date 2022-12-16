import { ConfigEnv, defineConfig, PluginOption } from "vite";
import createStudioPlugin from "@yext/studio-plugin";
import react from "@vitejs/plugin-react";
import svgr from 'vite-plugin-svgr'

console.log('starto!')

export default defineConfig(async (args: ConfigEnv) => {
  // const studioPluginModule = await import('@yext/studio-plugin')
  // console.log(studioPluginModule)
  return {
    root: __dirname,
    plugins: [react(), createStudioPlugin(args), svgr() as PluginOption],
    css: {
      postcss: __dirname,
    },
  };
});
