import { expect } from "@playwright/test";
import { studioTest } from "./infra/studioTest.js";
import fs from "fs";

const expectedPage = fs.readFileSync(
  "./tests/__fixtures__/shift-rearrange-elements-expected-page.tsx",
  "utf-8"
);

studioTest(
  "can rearrange multiple elements in tree using shift",
  async ({ page, studioPage }) => {
    await page.getByText("Insert").click();
    await page.getByText("Footer").click();

    const container = page.getByText("Container");
    const banner = page.getByText("Banner");
    const div = page.getByRole("list").filter({ hasText: "div" });
    const divBox = await div.boundingBox();

    await banner.click();
    await page.keyboard.down("Shift");
    await container.click();
    await page.keyboard.up("Shift");
    await expect(page).toHaveScreenshot();

    await banner.hover();
    await page.mouse.down();
    divBox &&
      (await page.mouse.move(divBox.x + divBox.width / 4, divBox.y, {
        steps: 1000,
      }));
    await page.waitForTimeout(1000);
    await page.mouse.up();
    await expect(page).toHaveScreenshot();

    await studioPage.saveButton.click();
    const pagePath = studioPage.getPagePath("BasicPage");
    await expect(pagePath).toHaveContents(expectedPage);
    await expect(page).toHaveScreenshot();
  }
);
