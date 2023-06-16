#!/usr/bin/env node
import { execSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const pathToViteConfig = path.resolve(__dirname, "../../vite.config.ts");
const NODE_OPTIONS = 'NODE_OPTIONS="--experimental-specifier-resolution=node"';

execSync(`cross-env ${NODE_OPTIONS} npx vite --config ${pathToViteConfig}`, {
  stdio: "inherit",
});
