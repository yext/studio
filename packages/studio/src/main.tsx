import React from "react";
import ReactDOM from "react-dom/client";
import { App, hotReloadStore } from "@yext/studio-ui";
import { StudioHMRPayload, StudioHMRUpdateID } from "@yext/studio-plugin";
import "./tailwind-directives.css";

if (import.meta.hot) {
  import.meta.hot.on(StudioHMRUpdateID, (hmrPayload: StudioHMRPayload) => {
    void hotReloadStore(hmrPayload);
  });
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
