import { expect } from "@playwright/test";
import { studioTest } from "./infra/studioTest.js";

studioTest.use({
  createRemote: true,
});

studioTest("can deploy changes", async ({ studioPage }) => {
  const gitOps = studioPage.gitOps;
  const startingRef = await gitOps.getCurrentRef();
  const deployButton = studioPage.deployButton;
  await expect(deployButton.button).toHaveScreenshot();
  await studioPage.addElement("Container", "Containers", false);
  await expect(deployButton.button).toHaveScreenshot();

  const numCommitsBeforeDeploy = await gitOps.getNumCommitsFromRef(startingRef);
  expect(numCommitsBeforeDeploy).toEqual(0);
  await studioPage.deployButton.click();

  await expect(deployButton.button).toHaveScreenshot();
  const numCommitsMade = await gitOps.getNumCommitsFromRef(startingRef);
  expect(numCommitsMade).toEqual(1);
  const commitMsg = await gitOps.getCommitMessage();
  expect(commitMsg).toEqual("Yext Studio Commit\n");
});
