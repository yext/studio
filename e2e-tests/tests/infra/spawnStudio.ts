import { spawn } from "child_process";
import net from "net";
import { globSync } from "glob";
import { TestInfo } from "@playwright/test";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Spawns a studio process that uses the given project root.
 *
 * spawn is used over spawnSync because otherwise the test will be blocked from running.
 * stdio is piped instead of inherited because Playwright does not seem to work with inherit
 * (it will work fine if ran through a regular node program).
 */
export default async function spawnStudio(
  rootDir: string,
  debug: boolean,
  testInfo: TestInfo
) {
  const port = await getPort(testInfo);
  const child = spawn(
    "npx",
    ["studio", "--port", port.toString(), "--root", rootDir],
    { stdio: "pipe", shell: true }
  );

  child.on("error", console.error);
  if (debug) {
    child.stderr?.on("data", process.stderr.write);
    child.stdout?.on("data", process.stdout.write);
  }

  await waitForPort(port);
  return port;
}

/**
 * Gets a bespoke port for this test.
 * The port is guaranteed to only be used by this test.
 */
async function getPort(testInfo: TestInfo) {
  let port = 5173 + getTestNumber(testInfo);
  const totalNumTests = getTestGlob().length;

  let portIsOccupied = await serverExistsForPort(port);
  while (portIsOccupied) {
    port += totalNumTests;
    portIsOccupied = await serverExistsForPort(port);
  }
  return port;
}

async function serverExistsForPort(port: number) {
  return new Promise<boolean>((resolve) => {
    const conn = net.connect(port, "127.0.0.1");
    conn
      .on("error", () => resolve(false))
      .on("connect", () => {
        conn.end();
        resolve(true);
      });
  });
}

async function waitForPort(port: number): Promise<void> {
  const timeout = 30_000;
  const cancellationToken = { canceled: false };
  setTimeout(() => (cancellationToken.canceled = true), timeout);
  while (!cancellationToken.canceled) {
    const isReady = await serverExistsForPort(port);
    if (isReady) {
      return;
    }
    const pollingDelay = new Promise((resolve) => setTimeout(resolve, 500));
    await pollingDelay;
  }
  throw new Error(
    `Timed out waiting ${timeout}ms for the studio server on port ${port}.`
  );
}

const getTestGlob = () => globSync("./tests/**/*.spec.ts");

function getTestNumber(testInfo: TestInfo) {
  const testPaths = getTestGlob().sort();
  return testPaths.findIndex((testPath) => {
    const absolutePath = resolve(__dirname, "../..", testPath);
    return absolutePath === testInfo.file;
  });
}
