// ../../packages/studio/vite.config.ts
import {
  defineConfig,
  searchForWorkspaceRoot
} from "file:///Users/oshi/studio-prototype/packages/studio/node_modules/vite/dist/node/index.js";
import createStudioPlugin from "file:///Users/oshi/studio-prototype/packages/studio-plugin/lib/createStudioPlugin.js";
import react from "file:///Users/oshi/studio-prototype/packages/studio/node_modules/@vitejs/plugin-react/dist/index.mjs";
import svgr from "file:///Users/oshi/studio-prototype/node_modules/vite-plugin-svgr/dist/index.mjs";
var __vite_injected_original_dirname = "/Users/oshi/studio-prototype/packages/studio";
var vite_config_default = defineConfig((args) => {
  return {
    root: __vite_injected_original_dirname,
    server: {
      host: "0.0.0.0",
      fs: {
        allow: [
          searchForWorkspaceRoot(process.cwd()),
          process.cwd(),
          __vite_injected_original_dirname
        ]
      }
    },
    build: {
      rollupOptions: {
        input: ["index.html", "src/store/useStudioStore.ts"]
      }
    },
    plugins: [react(), createStudioPlugin(args), svgr()],
    css: {
      postcss: __vite_injected_original_dirname
    }
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vcGFja2FnZXMvc3R1ZGlvL3ZpdGUuY29uZmlnLnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL1VzZXJzL29zaGkvc3R1ZGlvLXByb3RvdHlwZS9wYWNrYWdlcy9zdHVkaW9cIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9Vc2Vycy9vc2hpL3N0dWRpby1wcm90b3R5cGUvcGFja2FnZXMvc3R1ZGlvL3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9Vc2Vycy9vc2hpL3N0dWRpby1wcm90b3R5cGUvcGFja2FnZXMvc3R1ZGlvL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHtcbiAgQ29uZmlnRW52LFxuICBkZWZpbmVDb25maWcsXG4gIFBsdWdpbk9wdGlvbixcbiAgc2VhcmNoRm9yV29ya3NwYWNlUm9vdCxcbiAgVXNlckNvbmZpZyxcbn0gZnJvbSBcInZpdGVcIjtcbmltcG9ydCBjcmVhdGVTdHVkaW9QbHVnaW4gZnJvbSBcIkB5ZXh0L3N0dWRpby1wbHVnaW4vc3JjL2NyZWF0ZVN0dWRpb1BsdWdpblwiO1xuaW1wb3J0IHJlYWN0IGZyb20gXCJAdml0ZWpzL3BsdWdpbi1yZWFjdFwiO1xuaW1wb3J0IHN2Z3IgZnJvbSBcInZpdGUtcGx1Z2luLXN2Z3JcIjtcblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKChhcmdzOiBDb25maWdFbnYpOiBVc2VyQ29uZmlnID0+IHtcbiAgcmV0dXJuIHtcbiAgICByb290OiBfX2Rpcm5hbWUsXG4gICAgc2VydmVyOiB7XG4gICAgICBob3N0OiBcIjAuMC4wLjBcIixcbiAgICAgIGZzOiB7XG4gICAgICAgIGFsbG93OiBbXG4gICAgICAgICAgc2VhcmNoRm9yV29ya3NwYWNlUm9vdChwcm9jZXNzLmN3ZCgpKSxcbiAgICAgICAgICBwcm9jZXNzLmN3ZCgpLFxuICAgICAgICAgIF9fZGlybmFtZSxcbiAgICAgICAgXSxcbiAgICAgIH0sXG4gICAgfSxcbiAgICBidWlsZDoge1xuICAgICAgcm9sbHVwT3B0aW9uczoge1xuICAgICAgICBpbnB1dDogW1wiaW5kZXguaHRtbFwiLCBcInNyYy9zdG9yZS91c2VTdHVkaW9TdG9yZS50c1wiXSxcbiAgICAgIH0sXG4gICAgfSxcbiAgICBwbHVnaW5zOiBbcmVhY3QoKSwgY3JlYXRlU3R1ZGlvUGx1Z2luKGFyZ3MpLCBzdmdyKCkgYXMgUGx1Z2luT3B0aW9uXSxcbiAgICBjc3M6IHtcbiAgICAgIHBvc3Rjc3M6IF9fZGlybmFtZSxcbiAgICB9LFxuICB9O1xufSk7XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQXNUO0FBQUEsRUFFcFQ7QUFBQSxFQUVBO0FBQUEsT0FFSztBQUNQLE9BQU8sd0JBQXdCO0FBQy9CLE9BQU8sV0FBVztBQUNsQixPQUFPLFVBQVU7QUFUakIsSUFBTSxtQ0FBbUM7QUFXekMsSUFBTyxzQkFBUSxhQUFhLENBQUMsU0FBZ0M7QUFDM0QsU0FBTztBQUFBLElBQ0wsTUFBTTtBQUFBLElBQ04sUUFBUTtBQUFBLE1BQ04sTUFBTTtBQUFBLE1BQ04sSUFBSTtBQUFBLFFBQ0YsT0FBTztBQUFBLFVBQ0wsdUJBQXVCLFFBQVEsSUFBSSxDQUFDO0FBQUEsVUFDcEMsUUFBUSxJQUFJO0FBQUEsVUFDWjtBQUFBLFFBQ0Y7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLElBQ0EsT0FBTztBQUFBLE1BQ0wsZUFBZTtBQUFBLFFBQ2IsT0FBTyxDQUFDLGNBQWMsNkJBQTZCO0FBQUEsTUFDckQ7QUFBQSxJQUNGO0FBQUEsSUFDQSxTQUFTLENBQUMsTUFBTSxHQUFHLG1CQUFtQixJQUFJLEdBQUcsS0FBSyxDQUFpQjtBQUFBLElBQ25FLEtBQUs7QUFBQSxNQUNILFNBQVM7QUFBQSxJQUNYO0FBQUEsRUFDRjtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
