// vite.config.js
import { resolve } from "path";
import { defineConfig, PluginOption } from "vite";
import svgr from "vite-plugin-svgr";
import { visualizer } from "rollup-plugin-visualizer";
import dts from "vite-plugin-dts";
import cssInjectedByJsPlugin from "vite-plugin-css-injected-by-js";

export default defineConfig({
  plugins: [
    svgr(),
    dts(),
    cssInjectedByJsPlugin(),
    visualizer() as PluginOption,
  ],
  build: {
    outDir: "lib",
    sourcemap: true,
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      formats: ["es"],
      fileName: "src/index",
    },
    rollupOptions: {
      external: [
        "virtual_yext-studio-git-data",
        "virtual_yext-studio",
        "@pathToUserProjectRoot/tailwind.config",
        "react",
        "react-dom",
        "react/jsx-runtime",
      ],
    },
  },
});
