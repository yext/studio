#!/usr/bin/env node
import { spawn } from "child_process";
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
  .action(async (options: CliArgs) => {
    // create pages development server
    const pagesServer = spawn(
      "npx",
      ["pages", "dev", "--open-browser=false"],
      {
        stdio: ["ignore", "pipe", "pipe"],
        env: {
          ...process.env,
        },
        shell: true,
      }
    );

    // stream pages server errors to parent process with a prefix
    pagesServer.stderr.setEncoding('utf-8');
    pagesServer.stderr.on('data', (data : string) => {
      data.split("\n").map((line : string) => {
        console.error("Pages Development Server |", line.trim());
      })
    });

    const studioServer = spawn(
      "npx",
      ["cross-env", NODE_OPTIONS, "npx", "vite", "--config", pathToViteConfig],
      {
        stdio: ["ignore", "inherit", "inherit"],
        env: {
          ...process.env,
          YEXT_STUDIO_ARGS: JSON.stringify(options),
        },
        shell: true,
      }
    );

    // kill pages development if studio exits
    studioServer.addListener("exit", () => {
      pagesServer.kill()
    })

    // kill studio if pages development exits
    pagesServer.addListener("exit", () => {
      studioServer.kill()
    })

    // Exit parent process once both child processes have exited
    const pagesPromise = new Promise((resolve) => {
      pagesServer.on("close", resolve)
    })
    const studioPromise = new Promise((resolve) => {
      studioServer.on("close", resolve)
    })
    return Promise.all([pagesPromise, studioPromise])
    })

cli.help();
cli.parse();
