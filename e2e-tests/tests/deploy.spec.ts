import { expect } from "@playwright/test";
import { studioTest } from "./infra/studioTest.js";

studioTest.use({
  createRemote: true,
});

studioTest("can deploy changes", async ({ studioPage }) => {
  const gitOps = studioPage.gitOps;
  const startingRef = await gitOps.getCurrentRef();
  await studioPage.addElement("Container", "Layouts");
  await studioPage.takePageScreenshotAfterImgRender();

  const numCommitsBeforeDeploy = await gitOps.getNumCommitsFromRef(startingRef);
  expect(numCommitsBeforeDeploy).toEqual(0);
  await studioPage.deployButton.click();

  await studioPage.takePageScreenshotAfterImgRender();
  const numCommitsMade = await gitOps.getNumCommitsFromRef(startingRef);
  expect(numCommitsMade).toEqual(1);
  const commitMsg = await gitOps.getCommitMessage();
  expect(commitMsg).toEqual("Yext Studio Commit\n");
});
