import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import simpleGit from "simple-git";
import { TestInfo } from "@playwright/test";
import fs from "fs";
import fsExtra from "fs-extra";
import spawnStudio from "./spawnStudio.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Spawns a studio instance for the test that will not be shared
 * with any other tests. This instance runs in a temporary folder.
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
  let cleanupChildProcess: (() => boolean) | null = null;
  let gitCleanup: (() => Promise<void>) | null = null;
  let tmpDir: string | null = null;

  try {
    tmpDir = createTempWorkingDir(testInfo);
    if (createRemote) {
      gitCleanup = await createRemoteBranch(testInfo, tmpDir);
    }
    const { port, kill } = await spawnStudio(tmpDir, debug, testInfo);
    cleanupChildProcess = kill;
    await run(port, tmpDir);
  } finally {
    cleanupChildProcess?.();
    await gitCleanup?.();
    if (!debug && tmpDir) {
      fsExtra.rmdirSync(tmpDir, { recursive: true });
    }
  }
}

/**
 * Creates and checks out a new branch for the test,
 * then pushes it to the remote.
 */
async function createRemoteBranch(testInfo: TestInfo, tmpDir: string) {
  const git = simpleGit(tmpDir);
  const testFile = getTestFilename(testInfo);
  const date = new Date();
  const dateString = `${date.getMonth()}-${date.getDate()}-${date.getFullYear()}-${date.getMilliseconds()}`;
  const testBranch = `e2e-test_${testFile}_${dateString}`;
  const tmpDirGitPath = path.join(tmpDir, '.git');
  fsExtra.mkdirSync(tmpDirGitPath)
  fsExtra.cpSync(tmpDirGitPath, '.git', { recursive: true })
  await git.add("-A");
  await git.commit("initial commit for " + testBranch);
  await git.push(["-u", "origin", "HEAD"]);
  return async () => {
    await git.push(["--delete", "origin", testBranch]);
  };
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
