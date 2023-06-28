import { expect } from "@playwright/test";
import { studioTest } from "./infra/studioTest.js";
import fs from "fs";

const fixedComponent = fs.readFileSync(
  "./tests/__fixtures__/fixed-error-component.tsx",
  "utf-8"
);

studioTest("can fix an error component", async ({ page, studioPage }) => {
  await studioPage.switchPage("ErrorComponentPreviews");
  await expect(page).toHaveScreenshot();

  fs.writeFileSync("./src/components/ErrorComponent.tsx", fixedComponent);
  await expect(page).toHaveScreenshot();

  await studioPage.setActiveComponent("ErrorComponent");
  await expect(page).toHaveScreenshot();
});
