import React from "react";
import ReactDOM from "react-dom/client";
import {
  AppWithLazyLoading,
  hotReloadStudioData,
  hotReloadGitData,
  StudioHMRUpdateID,
  GitDataHMRUpdateID,
} from "@yext/studio-ui";
import type { StudioHMRPayload, GitDataHMRPayload } from "@yext/studio-plugin";
import "./tailwind-directives.css?studioStyling";

if (import.meta.hot) {
  import.meta.hot.on(StudioHMRUpdateID, (hmrPayload: StudioHMRPayload) => {
    void hotReloadStudioData(hmrPayload);
  });
  import.meta.hot.on(GitDataHMRUpdateID, (hmrPayload: GitDataHMRPayload) => {
    void hotReloadGitData(hmrPayload);
  });
}
const WrappedApp = import.meta.env.VITE_STUDIO_STRICT === "true"
  ? <React.StrictMode>
      <AppWithLazyLoading />
    </React.StrictMode>
  : <AppWithLazyLoading />

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  WrappedApp
);
