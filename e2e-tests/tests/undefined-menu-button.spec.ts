import { expect } from "@playwright/test";
import { studioTest } from "./infra/studioTest.js";

studioTest("renders undefined menu button", async ({ page, studioPage }) => {
  await studioPage.setActiveComponent("Banner");
  await page.getByLabel("Toggle undefined value menu").first().click();
  await expect(page).toHaveScreenshot();
  await page.getByText("Reset to Default").hover();
  await page.mouse.wheel(200, 0);
  await expect(page).toHaveScreenshot();
});
