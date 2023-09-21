import { expect } from "@playwright/test";
import { studioTest } from "./infra/studioTest.js";
import fs from "fs";

const expectedPage = fs.readFileSync(
  "./tests/__fixtures__/rearrange-elements-expected-page.tsx",
  "utf-8"
);

studioTest("can rearrange elements in tree", async ({ page, studioPage }) => {
  await studioPage.switchPage("LocationPage");
  const hoursDisplay = page.getByText("HoursDisplay");
  const addressDisplay = page
    .getByRole("listitem")
    .filter({ hasText: /^AddressDisplay$/ });
  const addressDisplayBox = await addressDisplay.boundingBox();

  await hoursDisplay.hover();
  await page.mouse.down();
  addressDisplayBox &&
    (await page.mouse.move(
      addressDisplayBox.x + addressDisplayBox.width / 4,
      addressDisplayBox.y,
      {
        steps: 1000,
      }
    ));
  await page.waitForTimeout(1000);
  await page.mouse.up();
  await expect(studioPage.saveButton.button).toBeEnabled();
  await studioPage.takePageScreenshotAfterImgRender();

  await studioPage.saveButton.click();
  const pagePath = studioPage.getPagePath("LocationPage");
  await expect(pagePath).toHaveContents(expectedPage);
  await expect(studioPage.saveButton.button).toBeDisabled();
});
