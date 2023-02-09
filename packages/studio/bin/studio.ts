#!/usr/bin/env node
import { execSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

execSync(
  "node --experimental-specifier-resolution=node node_modules/.bin/vite --config " +
    path.resolve(__dirname, "../../vite.config.ts"),
  { stdio: "inherit" }
);
