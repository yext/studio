import { test as base } from "@playwright/test";
import StudioPlaywrightPage from "./StudioPlaywrightPage.js";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import simpleGit from "simple-git";

const git = simpleGit();
let originalBranchName: string;
let testBranchName: string;
const branchesToDelete: string[] = [];

base.beforeAll(async () => {
  originalBranchName = await git.revparse(["--abbrev-ref", "HEAD"]);
});

base.beforeEach(async ({}, testInfo) => {
  const testFile = testInfo.file.split("/").at(-1);
  testBranchName = `e2e-test_${testFile}_${Date.now()}`;
  console.log("checking out", testBranchName);
  await git.checkout(["-b", testBranchName]);
  await git.push(["-u", "origin", "HEAD"]);
  branchesToDelete.push(testBranchName);
});

base.afterEach(async ({}, testInfo) => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const e2eSrcPath = path.resolve(__dirname, "../../src/*");
  await git.add(e2eSrcPath);
  await git.commit(testInfo.title);
  await git.checkout(originalBranchName);
});

base.afterAll(async () => {
  await Promise.all(
    branchesToDelete.flatMap((branchName) => {
      return [
        git.branch(["-D", branchName]),
        git.push(["--delete", "origin", branchName]),
      ];
    })
  );
});

type Fixtures = {
  studioPage: StudioPlaywrightPage;
};

/**
 * studioTest extends the base playwright test by providing a StudioPage Page Object Model,
 * and also performing setup and cleanup.
 */
export const studioTest = base.extend<Fixtures>({
  studioPage: async ({ page }, use) => {
    await page.goto("./");
    const studioPage = new StudioPlaywrightPage(page);
    await use(studioPage);
  },
});
