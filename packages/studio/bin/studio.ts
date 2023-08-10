#!/usr/bin/env node
import { spawnSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import cac from "cac";
import { CliArgs } from "@yext/studio-plugin";
import libexec from "libnpmexec"

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const pathToViteConfig = path.resolve(__dirname, "../../vite.config.ts");
const NODE_OPTIONS = 'NODE_OPTIONS="--experimental-specifier-resolution=node"';
const cli = cac();

cli
  .command("", "start dev server")
  .option("--port <port>", "[number] port to run studio")
  .option("--root <directory>", `[string] path to the root directory`)
  .action((options: CliArgs) => {
    libexec({
      args: ["cross-env", NODE_OPTIONS, "vite", "--config", pathToViteConfig],
      npxCache: '/Users/oshi/.npm/_npx',
      cache: '/Users/oshi/.npm/_cacache'
    })
  });

cli.help();
cli.parse();
