import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

import simpleGit from "simple-git";
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
  run: () => Promise<void>
) {
  const originalBranch = await git.revparse(["--abbrev-ref", "HEAD"]);
  const testFile = testInfo.file.split("/").at(-1);
  const testBranch = `e2e-test_${testFile}_${Date.now()}`;
  console.log("checking out", testBranch);
  await git.checkout(["-b", testBranch]);
  await git.push(["-u", "origin", "HEAD"]);

  try {
    await run();
  } finally {
    await git.add(e2eSrcPath);
    await git.commit(testInfo.title);
    await git.checkout(originalBranch);

    await Promise.all([
      git.branch(["-D", testBranch]),
      git.push(["--delete", "origin", testBranch]),
    ]);
  }
}
