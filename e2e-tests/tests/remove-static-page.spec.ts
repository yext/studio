import { expect } from "@playwright/test";
import { studioTest } from "./infra/studioTest.js";
import fs from "fs";

studioTest("can remove a static page", async ({ page, studioPage }) => {
  const pageInTree = page.getByText("BasicPage");
  await expect(pageInTree).toHaveCount(1);
  await studioPage.removePage("BasicPage");
  await expect(pageInTree).toHaveCount(0);
  await studioPage.saveButton.click();
  const pagePath = studioPage.getPagePath("BasicPage");
  expect(fs.existsSync(pagePath)).toBeFalsy();
  await studioPage.takePageScreenshotAfterImgRender();

  // Ensure that the page is still deleted after a browser refresh.
  await page.reload();
  await studioPage.takePageScreenshotAfterImgRender();
});
