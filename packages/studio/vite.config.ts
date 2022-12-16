import { ConfigEnv, defineConfig } from "vite";
import createStudioPlugin from "@yext/studio-plugin";
import react from "@vitejs/plugin-react";



console.log('starto!')
// https://vitejs.dev/config/
export default defineConfig(async (args: ConfigEnv) => {
  const studioPluginModule = await import('@yext/studio-plugin')
  console.log(studioPluginModule)
  return {
    root: __dirname,
    plugins: [react(), createStudioPlugin(args)],
    optimizeDeps: {
      exclude: ['@yext/studio-plugin']
    }
  }
});
