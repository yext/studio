import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import simpleGit from "simple-git";
import { TestInfo } from "@playwright/test";
const git = simpleGit();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const e2eSrcPath = path.resolve(__dirname, "../../src/*");
const screenshotsPath = path.resolve(__dirname, "../../__screenshots__/*")

/**
 * Wraps the given test run method with a bespoke git branch, which will be
 * cleaned up at the end of the test run.
 *
 * After the test is complete, the repo will be set back to the original branch
 * (or detached commit) it was originally on.
 * Any uncommitted changes will also be restored.
 */
export default async function setupGitBranch(
  testInfo: TestInfo,
  createRemote: boolean,
  run: () => Promise<void>
) {
  const initialData = await getInitialGitData();
  const testBranch = await createTestBranch(testInfo, createRemote);

  try {
    await run();
  } finally {
    await restoreGitState(testInfo, initialData, testBranch);

    await Promise.all([
      // git.branch(["-D", testBranch]),
      createRemote && git.push(["--delete", "origin", testBranch]),
    ]);
  }
}

type InitialGitData = {
  originalBranch: string;
  originalRef: string;
  uncommittedChanges: string;
};

/**
 * Retrieves git data about the initial state of the repo,
 * before the test is run.
 */
async function getInitialGitData(): Promise<InitialGitData> {
  const originalBranch = (await git.raw(["branch", "--show-current"])).trim();
  let originalRef = await git.revparse(["HEAD"]);

  const uncommittedChanges = (await git.raw(["status", "--porcelain"])).trim();
  if (uncommittedChanges) {
    await git.add("-A");
    await git.commit("Preserving uncommitted changes before running e2e-tests");
    originalRef = await git.revparse(["HEAD"]);
  }
  return { originalBranch, originalRef, uncommittedChanges };
}

/**
 * Creates and checks out a new branch for the test.
 * If createRemote is set to true, will push the new branch to remote.
 */
async function createTestBranch(testInfo: TestInfo, createRemote: boolean) {
  const testFile = testInfo.file.split("/").at(-1);
  const testBranch = `e2e-test_${testFile}_${Date.now()}`;
  await git.checkout(["-b", testBranch]);
  if (createRemote) {
    await git.push(["-u", "origin", "HEAD"]);
  }
  return testBranch;
}

/**
 * Restores the repo to its initial state before the test was run.
 */
async function restoreGitState(
  testInfo: TestInfo,
  initialData: InitialGitData,
  testBranch: string
) {
  const { originalBranch, originalRef, uncommittedChanges } = initialData;
  console.log('initial data', initialData)
  // Commit any changes in e2e-tests/src, so that they will be removed
  // when the repo is reset to its original commit.
  await git.add([e2eSrcPath, screenshotsPath]);
  await git.commit(testInfo.title);
  if (originalBranch) {
    await git.checkout(originalBranch);
  } else {
    await git.checkout(originalRef);
  }

  if (uncommittedChanges) {
    await git.reset(["HEAD^"]);
  }
  console.log('running git raw', "checkout", testBranch, "--", screenshotsPath);
  await git.raw(["checkout", testBranch, "--", screenshotsPath]);
}
