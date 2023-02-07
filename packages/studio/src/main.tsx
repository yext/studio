import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./tailwind-directives.css";
import "react-tooltip/dist/react-tooltip.css";
import { StudioHMRPayload } from "@yext/studio-plugin";
import syncStudioStore from "./store/syncStudioStore";
import useStudioStore from "./store/useStudioStore";

if (import.meta.hot) {
  import.meta.hot.on("studio:update", (hmrPayload: StudioHMRPayload) => {
    syncStudioStore(hmrPayload, useStudioStore);
  });
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
