import { expect } from "@playwright/test";
import { studioTest } from "./infra/studioTest.js";

studioTest(
  "can open the pages development server",
  async ({ page, studioPage }) => {
    // Start waiting for popup before clicking
    const popupPromise = page.waitForEvent("popup");
    await studioPage.livePreviewButton.click({ position: { x: 75, y: 0 } });
    const popup = await popupPromise;
    await popup.waitForLoadState();
    await expect(popup).toHaveTitle("Pages Development");
  }
);
