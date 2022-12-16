import { ConfigEnv, defineConfig } from "vite";
import createStudioPlugin from "@yext/studio-plugin";
import react from "@vitejs/plugin-react";

console.log('starto!')

export default defineConfig((args: ConfigEnv) => {
  return {
    root: __dirname,
    plugins: [react(), createStudioPlugin(args)]
  }
});
