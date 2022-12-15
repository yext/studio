import { ConfigEnv, defineConfig } from "vite";
import createStudioPlugin from "@yext/studio-plugin";
import react from "@vitejs/plugin-react";
import rollupTypescript from '@rollup/plugin-typescript'

console.log('starto!')
// https://vitejs.dev/config/
export default defineConfig((args: ConfigEnv) => ({
  root: __dirname,
  plugins: [react(), createStudioPlugin(args), rollupTypescript()],
  // include: ['@yext/studio-plugin']
}));
