import React from "react";
import ReactDOM from "react-dom/client";
import {
  App,
  hotReloadStudioData,
  hotReloadGitData,
  StudioHMRUpdateID,
  GitDataHMRUpdateID,
} from "@yext/studio-ui";
import type { StudioHMRPayload, GitDataHMRPayload } from "@yext/studio-plugin";
import "./tailwind-directives.css";

if (import.meta.hot) {
  import.meta.hot.on(StudioHMRUpdateID, (hmrPayload: StudioHMRPayload) => {
    void hotReloadStudioData(hmrPayload);
  });
  import.meta.hot.on(GitDataHMRUpdateID, (hmrPayload: GitDataHMRPayload) => {
    void hotReloadGitData(hmrPayload);
  });
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
