import { expect } from "@playwright/test";
import { studioTest } from "./infra/studioTest.js";
import fs from "fs";

const expectedPage = fs.readFileSync(
  "./tests/__fixtures__/add-entity-page-expected-page.tsx",
  "utf-8"
);

studioTest("can add an entity page", async ({ page, studioPage }) => {
  const pageInTree = page.getByText("EntityPage");
  await expect(pageInTree).toHaveCount(0);

  const addPageSection = studioPage.addPageSection;
  await addPageSection.selectPageType(true);
  await addPageSection.enterStreamScope({}, true);
  await addPageSection.enterBasicPageData("EntityPage", "entity-page");
  await addPageSection.selectLayout();

  // TODO: Specify a stream scope once we can supply an API key for populating
  // the store with account content
  await expect(pageInTree).toHaveCount(1);
  await studioPage.saveButton.click();
  const expectedPagePath = studioPage.getPagePath("EntityPage");
  await expect(expectedPagePath).toHaveContents(expectedPage);
  await studioPage.takePageScreenshotAfterImgRender();
});
