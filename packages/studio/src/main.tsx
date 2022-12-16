import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

import studioData from "virtual:yext-studio";
import { StudioData } from '@yext/studio-plugin';
console.log(studioData)


ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

function initStateManager(studioData: StudioData) {

}