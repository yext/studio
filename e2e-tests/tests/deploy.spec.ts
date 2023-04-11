import { expect } from "@playwright/test";
import { studioTest } from "./infra/studioTest.js";
import simpleGit from "simple-git";
const git = simpleGit();

studioTest.use({
  createRemote: true,
});

studioTest("can deploy changes", async ({ page, studioPage }) => {
  const startingRef = await git.revparse(["HEAD"]);
  await studioPage.addElement("Container", "Containers");
  await expect(page).toHaveScreenshot();

  const numCommitsBeforeDeploy = await getNumCommitsFromRef(startingRef);
  expect(numCommitsBeforeDeploy).toEqual(0);
  await studioPage.deployButton.click();

  await expect(page).toHaveScreenshot();
  const numCommitsMade = await getNumCommitsFromRef(startingRef);
  expect(numCommitsMade).toEqual(1);
  const commitMsg = await git.raw(["show-branch", "--no-name", "HEAD"]);
  expect(commitMsg).toEqual("Yext Studio Commit\n");
});

/**
 * Gets the numbers of commits between the current remote branch and the given ref.
 */
async function getNumCommitsFromRef(ref: string): Promise<number> {
  const branchName = (await git.raw(["branch", "--show-current"])).trim();
  const rawOutput = await git.raw([
    "rev-list",
    `${ref}..origin/${branchName}`,
    "--count",
  ]);
  return parseInt(rawOutput.trim());
}
