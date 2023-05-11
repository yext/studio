import { expect } from "@playwright/test";
import { studioTest } from "./infra/studioTest.js";
import fs from "fs";

const expectedPage = fs.readFileSync(
  "./tests/__fixtures__/rearrange-elements-expected-page.tsx",
  "utf-8"
);

studioTest("can rearrange elements in tree", async ({ page, studioPage }) => {
  await studioPage.saveButton.button.waitFor();
  const banner = page.getByText("Banner");
  const div = page.getByRole("list").filter({ hasText: "div" });
  const divBox = await div.boundingBox();

  await banner.hover();
  await page.mouse.down();
  divBox && (await page.mouse.move(divBox.x, divBox.y, { steps: 20 }));
  await page.mouse.up();
  await expect(page).toHaveScreenshot();

  await studioPage.saveButton.click();
  await expect("./src/pages/UniversalPage.tsx").toHaveContents(expectedPage);
  await expect(page).toHaveScreenshot();
});
