#!/usr/bin/env node
import { spawnSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import cac from "cac";
import { CliArgs } from "@yext/studio-plugin";

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
    spawnSync(
      "npx",
      ["cross-env", NODE_OPTIONS, "npx", "vite", "--config", pathToViteConfig],
      {
        stdio: "inherit",
        env: {
          ...process.env,
          YEXT_STUDIO_ARGS: JSON.stringify(options),
        },
        shell: true,
      }
    );
  });

cli.help();
cli.parse();
