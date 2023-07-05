import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import simpleGit from "simple-git";
import { TestInfo } from "@playwright/test";
import fs from "fs";
import fsExtra from "fs-extra";
import { spawn } from "child_process";
import net from "net";
import getPort, { portNumbers } from 'get-port';

const git = simpleGit();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 */
export default async function setup(
  testInfo: TestInfo,
  createRemote: boolean,
  run: (port: number) => Promise<void>
) {
  let remoteBranch: string | null = null;
  let tmpDir: string | null = null;
  try {
    if (createRemote) {
      remoteBranch = await createRemoteBranch(testInfo);
    }
    tmpDir = createTempWorkingDir(testInfo);
    const port = await spawnStudio(tmpDir);
    await run(port);
  } finally {
    remoteBranch && (await git.push(["--delete", "origin", remoteBranch]));
    tmpDir && fsExtra.rmdirSync(tmpDir, { recursive: true });
  }
}

/**
 * Spawns a studio process that uses the given project root.
 *
 * spawn is used over spawnSync because otherwise the test will be blocked from running.
 * stdio is piped instead of inherited because Playwright does not seem to work with inherit
 * (it will work fine if ran through a regular node program).
 */
async function spawnStudio(rootDir: string, debug = false): Promise<number> {
  const port = await getPort({port: portNumbers(5173, 6000)})
  const child = spawn("npx", ["studio", '--port', port.toString()], { stdio: "pipe", cwd: rootDir });
  if (debug) {
    child.stderr?.on("data", process.stderr.write);
    child.stdout?.on("data", process.stdout.write);
  }
  await waitForPort(port);
  return port
}

/**
 * Creates and checks out a new branch for the test,
 * then pushes it to the remote.
 */
async function createRemoteBranch(testInfo: TestInfo) {
  const testFile = getTestFilename(testInfo);
  const testBranch = `e2e-test_${testFile}_${Date.now()}`;
  await git.checkout(["-b", testBranch]);
  await git.push(["-u", "origin", "HEAD"]);
  return testBranch;
}

/**
 * Creates a temporary working directory for the test.
 */
function createTempWorkingDir(testInfo: TestInfo) {
  const prefix = getTestFilename(testInfo).split(".").at(0) + "_";
  const tmpDir = fs.mkdtempSync('__playground-' + prefix);
  const copy = (pathToCopy: string) => {
    const srcPath = path.resolve(__dirname, "../..", pathToCopy);
    const destPath = path.join(tmpDir, pathToCopy);
    fsExtra.copySync(srcPath, destPath);
  };
  copy("src");
  copy("localData");
  copy("studio.config.js");
  return tmpDir;
}

function getTestFilename(testInfo: TestInfo): string {
  return testInfo.file.split("/").at(-1) ?? "";
}

async function waitForPort(port: number): Promise<void> {
  const checkIfAvailable = () =>
    new Promise<boolean>((resolve) => {
      const conn = net.connect(port, "127.0.0.1");
      conn
        .on("error", () => resolve(false))
        .on("connect", () => {
          conn.end();
          resolve(true);
        });
    });

  const timeout = 30_000;
  const cancellationToken = { canceled: false };
  setTimeout(() => (cancellationToken.canceled = true), timeout);
  while (!cancellationToken.canceled) {
    const isReady = await checkIfAvailable();
    if (isReady) {
      return;
    }
    const pollingDelay = new Promise((resolve) => setTimeout(resolve, 500));
    await pollingDelay;
  }
  throw new Error(`Timed out waiting ${timeout}ms for the studio server.`);
}
