import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

import virtualStudioContext from "virtual:yext-studio";

console.log("virtual studio context =", virtualStudioContext);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
