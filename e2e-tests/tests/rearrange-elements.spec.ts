import { expect } from "@playwright/test";
import { studioTest } from "./infra/studioTest.js";
import fs from "fs";

const expectedPage = fs.readFileSync(
  "./tests/__fixtures__/rearrange-elements-expected-page.tsx",
  "utf-8"
);

studioTest("can rearrange elements in tree", async ({ page, studioPage }) => {
  await studioPage.switchPage("LocationPage");
  await studioPage.addElement("Footer", "Components", false);
  await expect(page).toHaveScreenshot();
  const footer = page.getByText("Footer");
  const businessInfo = page
    .getByRole("list")
    .filter({ hasText: "BusinessInfo" });
  const businessInfoBox = await businessInfo.boundingBox();

  await footer.hover();
  await page.mouse.down();
  businessInfoBox &&
    (await page.mouse.move(
      businessInfoBox.x,
      businessInfoBox.y + businessInfoBox.height - 5,
      {
        steps: 1000,
      }
    ));
  await page.waitForTimeout(1000);
  await page.mouse.up();
  await expect(page).toHaveScreenshot();

  await studioPage.saveButton.click();
  const pagePath = studioPage.getPagePath("LocationPage");
  await expect(pagePath).toHaveContents(expectedPage);
  await expect(page).toHaveScreenshot();
});
