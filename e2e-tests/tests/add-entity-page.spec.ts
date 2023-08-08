import { expect } from "@playwright/test";
import { studioTest } from "./infra/studioTest.js";
import { StreamScopeForm } from "./infra/StudioPlaywrightPage.js";
import fs from "fs";

const expectedPage = fs.readFileSync(
  "./tests/__fixtures__/add-entity-page-expected-page.tsx",
  "utf-8"
);

studioTest("can add an entity page", async ({ page, studioPage }) => {
  const pageInTree = page.getByText("EntityPage");
  await expect(pageInTree).toHaveCount(0);

  const streamScopeForm: StreamScopeForm = {
    entityTypes: "entity1",
    savedFilterIds: "entity2,entity3",
  };
  await studioPage.addEntityPage("EntityPage", streamScopeForm, "entity-page");
  await expect(pageInTree).toHaveCount(1);
  await expect(page).toHaveScreenshot();
  await studioPage.saveButton.click();
  await page.waitForTimeout(500);
  const expectedPagePath = studioPage.getPagePath("EntityPage");
  await expect(expectedPagePath).toHaveContents(expectedPage);
  await expect(page).toHaveScreenshot();
});
