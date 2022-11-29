#!/usr/bin/env node
import { execSync } from "child_process";
import path from "path";

execSync(
  "npx vite --config " + path.resolve(__dirname, "../../vite.config.ts"),
  { stdio: "inherit" }
);
