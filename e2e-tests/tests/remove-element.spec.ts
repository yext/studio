import { expect } from "@playwright/test";
import { studioTest } from "./infra/studioTest.js";
import fs from "fs";

const expectedPage = fs.readFileSync(
  "./tests/__fixtures__/remove-element-expected-page.tsx",
  "utf-8"
);

studioTest("can remove a container component", async ({ page, studioPage }) => {
  const containerPreviews = page.getByText("I'm a container:");
  const childPreviews = page.getByText("false");
  await expect(containerPreviews).toHaveCount(1);
  await expect(childPreviews).toHaveCount(1);
  await studioPage.removeElement("Container");
  await expect(containerPreviews).toHaveCount(0);
  await expect(childPreviews).toHaveCount(0);
  await expect(page).toHaveScreenshot();
  await studioPage.saveButton.click();
  await expect("./src/templates/BasicPage.tsx").toHaveContents(expectedPage);
  await expect(page).toHaveScreenshot();
});
