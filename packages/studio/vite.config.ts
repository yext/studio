import { ConfigEnv, defineConfig } from "vite";
import createStudioPlugin from "@yext/studio-plugin";
import react from "@vitejs/plugin-react";

console.log('starto!')

export default defineConfig(async (args: ConfigEnv) => {
  // const studioPluginModule = await import('@yext/studio-plugin')
  // console.log(studioPluginModule)
  return {
    root: __dirname,
    plugins: [react(), createStudioPlugin(args)],
  };
});
