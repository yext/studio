import { expect } from "@playwright/test";
import { studioTest } from "../infra/studioTest.js";
import fs from "fs";

const pageWithAddedElement = fs.readFileSync(
  "./tests/__fixtures__/add-element-page.tsx",
  "utf-8"
);

studioTest(
  "can update page file and see changes in UI via HMR",
  async ({ page, studioPage }) => {
    const previews = page.getByText("I'm a container:");
    await expect(previews).toHaveCount(1);
    fs.writeFileSync("./src/pages/UniversalPage.tsx", pageWithAddedElement);
    await expect(previews).toHaveCount(2);
    await expect(studioPage.saveButton).toBeDisabled();
    await expect(page).toHaveScreenshot();
  }
);
