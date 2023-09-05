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

  // TODO (SLAP-2906): Specify a stream scope once account content is populated
  await studioPage.addEntityPage("EntityPage", {}, "entity-page");
  await expect(pageInTree).toHaveCount(1);
  await expect(page).toHaveScreenshot();
  await studioPage.saveButton.click();
  const expectedPagePath = studioPage.getPagePath("EntityPage");
  await expect(expectedPagePath).toHaveContents(expectedPage);
  await expect(page).toHaveScreenshot();
});
