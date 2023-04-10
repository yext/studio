import { test as base } from "@playwright/test";
import StudioPlaywrightPage from "./StudioPlaywrightPage.js";
import setupGitBranch from "./setupGitBranch.js";

type Fixtures = {
  studioPage: StudioPlaywrightPage;
};

/**
 * studioTest extends the base playwright test by providing a StudioPage Page Object Model,
 * and also performing setup and cleanup.
 */
export const studioTest = base.extend<Fixtures>({
  studioPage: async ({ page }, use, testInfo) => {
    await setupGitBranch(testInfo, async () => {
      await page.goto("./");
      const studioPage = new StudioPlaywrightPage(page);
      await use(studioPage);
    });
  },
});

// /**
//  * Sets up a new git branch for the test, and returns the branch to be
//  * set back to after the test is complete.
//  */
// async function setupTestBranch(testInfo: TestInfo) {
//   const originalBranch = await git.revparse(["--abbrev-ref", "HEAD"]);
//   const testFile = testInfo.file.split("/").at(-1);
//   const testBranch = `e2e-test_${testFile}_${Date.now()}`;
//   console.log("checking out", testBranch);
//   await git.checkout(["-b", testBranch]);
//   await git.push(["-u", "origin", "HEAD"]);
//   return { originalBranch, testBranch };
// }

// async function cleanupTestBranch({ originalBranch, testBranch }: ReturnType<typeof setupTestBranch>, testInfo: TestInfo): Promise<void> {
//   const __filename = fileURLToPath(import.meta.url);
//   const __dirname = dirname(__filename);
//   const e2eSrcPath = path.resolve(__dirname, "../../src/*");
//   await git.add(e2eSrcPath);
//   await git.commit(testInfo.title);
//   await git.checkout(originalBranch);

//   await Promise.all([
//     git.branch(["-D", testBranch]),
//     git.push(["--delete", "origin", testBranch]),
//   ]);
// }
