#!/usr/bin/env node
const { execSync } = require("child_process");
const path = require("path");
console.log('directly running js')
execSync(
  "npx vite --config " + path.resolve(__dirname, "../vite.config.ts"),
  { stdio: "inherit" }
);
