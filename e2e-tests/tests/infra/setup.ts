import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import simpleGit from "simple-git";
import { TestInfo } from "@playwright/test";
import fs from "fs";
import fsExtra from "fs-extra";
import spawnStudio from "./spawnStudio.js";

const git = simpleGit();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 */
export default async function setup(
  opts: {
    testInfo: TestInfo;
    createRemote: boolean;
    debug: boolean;
  },
  run: (port: number, tmpDir: string) => Promise<void>
) {
  const { createRemote, testInfo, debug } = opts;
  let remoteBranch: string | null = null;
  let tmpDir: string | null = null;
  try {
    if (createRemote) {
      remoteBranch = await createRemoteBranch(testInfo);
    }
    tmpDir = createTempWorkingDir(testInfo);
    const { port, kill } = await spawnStudio(tmpDir, debug, testInfo);
    await run(port, tmpDir);
    kill();
  } finally {
    if (!debug) {
      tmpDir && fsExtra.rmdirSync(tmpDir, { recursive: true });
    }
    remoteBranch && (await git.push(["--delete", "origin", remoteBranch]));
  }
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
  const tmpDir = fs.mkdtempSync("__playground-" + prefix);
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
