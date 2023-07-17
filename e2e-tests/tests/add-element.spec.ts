import { expect } from "@playwright/test";
import { studioTest } from "./infra/studioTest.js";
import fs from "fs";

const expectedPage = fs.readFileSync(
  "./tests/__fixtures__/add-element-expected-page.tsx",
  "utf-8"
);

studioTest("can add a container component", async ({ page, studioPage }) => {
  const previews = studioPage.preview.getByText("I'm a container:");
  await expect(previews).toHaveCount(1);
  await studioPage.addElement("Container", "Layouts");
  await expect(previews).toHaveCount(2);
  await expect(page).toHaveScreenshot();
  await studioPage.saveButton.click();
  const pagePath = studioPage.getPagePath("BasicPage");
  await expect(pagePath).toHaveContents(expectedPage);
  await expect(page).toHaveScreenshot();
});
