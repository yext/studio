import { studioTest } from "./infra/studioTest.js";
import { expect } from "@playwright/test";

studioTest.only(
  "can create new nested modules",
  async ({ page, studioPage }) => {
    await studioPage.setActiveComponent("Banner");
    await studioPage.createModule("InnerModule");
    await expect(page.getByText("InnerModule")).toHaveCount(2);
    await expect(page).toHaveScreenshot();

    await studioPage.setActiveComponent("Container");
    await studioPage.createModule("OuterModule");
    await expect(page.getByText("OuterModule")).toHaveCount(2);
    await expect(page.getByText("InnerModule")).toHaveCount(0);
    await expect(page).toHaveScreenshot();

    await studioPage.saveButton.click();
    await expect(page).toHaveScreenshot();
    await page.reload();
    await expect(page.getByText("OuterModule")).toHaveCount(1);
    await expect(page.getByText("InnerModule")).toHaveCount(0);
    await expect(page).toHaveScreenshot();
  }
);
