import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./tailwind-directives.css";
import "react-tooltip/dist/react-tooltip.css";
import { StudioHMRPayload, StudioHMRUpdateID } from "@yext/studio-plugin";
import hotReloadStore from "./store/hotReloadStore";

if (import.meta.hot) {
  import.meta.hot.on(StudioHMRUpdateID, (hmrPayload: StudioHMRPayload) => {
    hotReloadStore(hmrPayload);
  });
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
