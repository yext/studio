#!/usr/bin/env node
import { execSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import process from "process"

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// const pathToConfig = 'file:///' + path.resolve(__dirname, "../../vite.config.ts");
const absPathToConfig = path.resolve(__dirname, "../../vite.config.ts");
const relativePathToConfig = 'file://' + path.relative(process.cwd(), absPathToConfig);
// const pathToConfig = "../../vite.config.ts";
console.log({ __dirname, absPathToConfig, relativePathToConfig, cwd: process.cwd() })

execSync(
  "node --experimental-specifier-resolution=node node_modules/vite/bin/vite.js --config " +
  relativePathToConfig,
  { stdio: "inherit" }
);
