import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

import simpleGit from "simple-git";
import { execSync } from "child_process"
import { TestInfo } from "@playwright/test";
const git = simpleGit();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const e2eSrcPath = path.resolve(__dirname, "../../src/*");

/**
 * Wraps the given test run method with a bespoke git branch, which will be
 * cleaned up at the end of the test run.
 */
export default async function setupGitBranch(
  testInfo: TestInfo,
  createRemote: boolean,
  run: () => Promise<void>
) {
  const originalBranch = execSync('git branch --show-current').toString().trim();
  let originalRef = await git.revparse(["HEAD"]);
  const uncommittedChanges = execSync('git status --porcelain').toString().trim();
  console.log({ uncommittedChanges })
  if (uncommittedChanges) {
    await git.add("-A");
    await git.commit(
      "Preserving uncommitted changes before running e2e-tests"
    )
    originalRef = await git.revparse(["HEAD"]);
  }
  console.log("original branch", originalRef);
  const testFile = testInfo.file.split("/").at(-1);
  const testBranch = `e2e-test_${testFile}_${Date.now()}`;
  await git.checkout(["-b", testBranch]);
  if (createRemote) {
    await git.push(["-u", "origin", "HEAD"]);
  }

  try {
    await run();
  } finally {
    // console.log("e2esrcpath", e2eSrcPath);
    await git.add([e2eSrcPath]);
    await git.commit(testInfo.title);
    if (originalBranch) {
      await git.checkout(originalBranch) 
    } else {
      await git.checkout(originalRef);
    }

    if (uncommittedChanges) {
      console.log('resetting to HEAD^')
      await git.reset(["HEAD^"]);
    }
    await Promise.all([
      git.branch(["-D", testBranch]),
      createRemote && git.push(["--delete", "origin", testBranch]),
    ]);
  }
}
