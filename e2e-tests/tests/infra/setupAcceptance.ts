import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import simpleGit from "simple-git";
import { TestInfo } from "@playwright/test";
import fs from "fs";
import fsExtra from "fs-extra";
import spawnStudio from "./spawnStudio.js";
import { globSync } from "glob";
import killPort from "kill-port";

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
  let port: number | null = null;
  let gitCleanup: (() => Promise<void>) | null = null;
  let tmpDir: string | null = null;

  try {
    tmpDir = createTempWorkingDir(testInfo);
    if (createRemote) {
      gitCleanup = await createRemoteBranch(testInfo, tmpDir);
    }
    port = await spawnStudio(tmpDir, debug, testInfo);
    await run(port, tmpDir);
  } finally {
    port && (await killPort(port));
    await gitCleanup?.();
    if (!debug && tmpDir) {
      rmdirRecursive(tmpDir);
    }
  }
}

/**
 * rmSync with recursive: true runs into ENOTEMPTY on Windows (even though it shouldn't).
 * As a workaround we can remove all files first.
 */
function rmdirRecursive(dir: string) {
  for (const file of globSync(`${dir}/**/*.{ts,tsx,js,json}`)) {
    fs.rmSync(file);
  }
  fs.rmSync(dir, { recursive: true });
}

/**
 * Creates a separate branch for the temporary folder that is then pushed to the remote.
 * This branch lives in it's own sub-repo, in order to separate out git state that is
 * modified during the test.
 *
 * The sub repo is created by copying the .git folder.
 * This was done instead of doing a fresh git init or git clone to avoid issues with github workflow
 * authentication not being passed to the sub-repo.
 */
async function createRemoteBranch(testInfo: TestInfo, tmpDir: string) {
  const git = simpleGit(tmpDir);
  const testFile = getTestFilename(testInfo);
  const date = new Date();
  const dateString = `${date.getMonth()}-${date.getDate()}-${date.getFullYear()}-${date.getMilliseconds()}`;
  const testBranch = `e2e-test_${testFile}_${dateString}`;
  const tmpDirGitPath = path.join(tmpDir, ".git");
  fsExtra.mkdirSync(tmpDirGitPath);
  fsExtra.cpSync(path.resolve(__dirname, "../../../.git"), tmpDirGitPath, {
    recursive: true,
  });
  await git.checkout(["-b", testBranch]);
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
  copy("sites-config");
  copy("studio.config.js");
  return tmpDir;
}

function getTestFilename(testInfo: TestInfo): string {
  return testInfo.file.split(path.sep).at(-1) ?? "";
}
