import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./tailwind-directives.css";
import "react-tooltip/dist/react-tooltip.css";
import registerCustomHMR from "./store/registerCustomHMR";

registerCustomHMR();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
