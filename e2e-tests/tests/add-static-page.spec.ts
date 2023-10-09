import { expect } from "@playwright/test";
import { studioTest } from "./infra/studioTest.js";
import fs from "fs";

const expectedPage = fs.readFileSync(
  "./tests/__fixtures__/add-static-page.tsx",
  "utf-8"
);

studioTest("can add a static page", async ({ page, studioPage }) => {
  const pageInTree = page.getByText("NewStaticPage");
  await expect(pageInTree).toHaveCount(0);

  const addPageSection = studioPage.addPageSection;
  await addPageSection.selectPageType(false, true);
  await addPageSection.enterBasicPageData("NewStaticPage", "index.html", true);
  await addPageSection.selectLayout();

  await expect(pageInTree).toHaveCount(1);
  await studioPage.takePageScreenshotAfterImgRender();
  await studioPage.saveButton.click();
  const pagePath = studioPage.getPagePath("NewStaticPage");
  await expect(pagePath).toHaveContents(expectedPage);
  await studioPage.takePageScreenshotAfterImgRender();
});
