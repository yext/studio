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

  // TODO: Specify a stream scope once we can supply an API key for populating
  // the store with account content
  await studioPage.addEntityPage("EntityPage", {}, "entity-page");
  await expect(pageInTree).toHaveCount(1);
  await studioPage.takePageScreenshotAfterImgRender();
  await studioPage.saveButton.click();
  const expectedPagePath = studioPage.getPagePath("EntityPage");
  await expect(expectedPagePath).toHaveContents(expectedPage);
  await studioPage.takePageScreenshotAfterImgRender();
});
