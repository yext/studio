import { expect } from "@playwright/test";
import { studioTest } from "./infra/studioTest.js";
import fs from "fs";

const expectedPage = fs.readFileSync(
  "./tests/__fixtures__/add-layout-page-expected.tsx",
  "utf-8"
);

studioTest("can add a page using a layout", async ({ page, studioPage }) => {
  const pageName = "LayoutPage";
  const pageInTree = page.getByText(pageName);
  await expect(pageInTree).toHaveCount(0);

  const addPageSection = studioPage.addPageSection;
  await addPageSection.selectPageType(false);
  await addPageSection.enterBasicPageData(pageName, "index.html");
  await addPageSection.selectLayout("LocationLayout", true);

  await expect(pageInTree).toHaveCount(1);
  await studioPage.saveButton.click();
  const pagePath = studioPage.getPagePath(pageName);
  await expect(pagePath).toHaveContents(expectedPage);
  await studioPage.takePageScreenshotAfterImgRender();
});
