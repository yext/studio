import { studioTest } from "./infra/studioTest.js";
import { expect } from "@playwright/test";

studioTest("components with parsing errors", async ({ page, studioPage }) => {
  await studioPage.switchPage("ErrorComponentPreviews");
  await expect(page).toHaveScreenshot();

  await page
    .getByText(
      "We will still try our best to render this component even with a parsing error."
    )
    .first()
    .hover();
  await expect(page).toHaveScreenshot();

  await studioPage.setActiveComponent("ErrorComponent");
  await expect(page).toHaveScreenshot();
});
