import { expect } from "@playwright/test";
import { studioTest } from "./infra/studioTest.js";
import fs from "fs";

studioTest("can fix an error page", async ({ page, studioPage }) => {
  fs.writeFileSync(
    "./src/pages/ErrorPage.tsx",
    "export default function ErrorPage() { return <></>; }"
  );
  await page.getByRole("button", { name: "ErrorPage" }).click();
  await expect(studioPage.saveButton.button).toBeDisabled();
  await expect(page).toHaveScreenshot();
});
