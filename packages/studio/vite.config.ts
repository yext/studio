import { ConfigEnv, defineConfig } from "vite";
import createStudioPlugin from "@yext/studio-plugin";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig((args: ConfigEnv) => ({
  root: __dirname,
  plugins: [react(), createStudioPlugin(args)],
}));
