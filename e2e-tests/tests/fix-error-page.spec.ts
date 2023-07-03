import { expect } from "@playwright/test";
import { studioTest } from "./infra/studioTest.js";
import fs from "fs";

const errorPageScript = fs.readFileSync(
  "./tests/__fixtures__/fix-error-page-script.tsx",
  "utf-8"
);

studioTest("can fix an error page", async ({ page, studioPage }) => {
  fs.writeFileSync("./src/templates/ErrorPage.tsx", errorPageScript);
  await page.getByRole("button", { name: "ErrorPage", exact: true }).click();
  await expect(studioPage.saveButton.button).toBeDisabled();
  await expect(page).toHaveScreenshot();
});
