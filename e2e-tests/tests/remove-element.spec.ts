import { expect } from "@playwright/test";
import { studioTest } from "./infra/studioTest.js";
import fs from "fs";

const expectedPage = fs.readFileSync(
  "./tests/__fixtures__/remove-element-expected-page.tsx",
  "utf-8"
);

studioTest("can remove a container component", async ({ studioPage }) => {
  const containerPreviews = studioPage.preview.getByText("I'm a container:");
  const childPreviews = studioPage.preview.getByText("false");
  const componentTreeSection = studioPage.componentTreeSection;

  await expect(containerPreviews).toHaveCount(1);
  await expect(childPreviews).toHaveCount(1);
  await componentTreeSection.takeScreenshot();
  await componentTreeSection.removeElement("Container");
  await componentTreeSection.takeScreenshot();
  await expect(containerPreviews).toHaveCount(0);
  await expect(childPreviews).toHaveCount(0);

  // TODO: Scope this to Screenshot of Preview pane.
  await studioPage.takePageScreenshotAfterImgRender();
  await studioPage.saveButton.click();
  const pagePath = studioPage.getPagePath("BasicPage");
  await expect(pagePath).toHaveContents(expectedPage);
  await studioPage.takePageScreenshotAfterImgRender();
});
