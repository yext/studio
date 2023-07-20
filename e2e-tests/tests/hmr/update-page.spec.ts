import { expect } from "@playwright/test";
import { studioTest } from "../infra/studioTest.js";
import fs from "fs";

const updatedPage = fs.readFileSync(
  "./tests/__fixtures__/hmr/updated-universal-page.tsx",
  "utf-8"
);

studioTest(
  "can update page file and see changes in UI via HMR",
  async ({ page, studioPage }) => {
    const containerPreviews = studioPage.preview.getByText("I'm a container:");
    await expect(containerPreviews).toHaveCount(1);
    const buttonPreviews = studioPage.preview.getByText("Press me!");
    await expect(buttonPreviews).toHaveCount(0);
    const pagePath = studioPage.getPagePath("BasicPage");
    fs.writeFileSync(pagePath, updatedPage);
    await expect(containerPreviews).toHaveCount(0);
    await expect(buttonPreviews).toHaveCount(2);
    await expect(studioPage.saveButton.button).toBeDisabled();
    await expect(page).toHaveScreenshot();
  }
);
