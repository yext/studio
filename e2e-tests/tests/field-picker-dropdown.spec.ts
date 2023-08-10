import { expect } from "@playwright/test";
import { studioTest } from "./infra/studioTest.js";

studioTest("renders field picker dropdown", async ({ page, studioPage }) => {
  await studioPage.addElement("Button", "Components");
  await studioPage.setActiveComponent("Button");
  await page.getByLabel("Toggle field picker").click();
  await page.getByText("Meta").click();
  await expect(page).toHaveScreenshot();
  await page.setViewportSize({ width: 1280, height: 250 });
  await page.mouse.wheel(0, 150);
  await expect(page).toHaveScreenshot();
});
