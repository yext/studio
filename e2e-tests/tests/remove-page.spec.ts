import { expect } from "@playwright/test";
import { studioTest } from "./infra/studioTest.js";
import fs from "fs";

studioTest("can remove a page", async ({ page, studioPage }) => {
  const pageInTree = page.getByText("UniversalPage");
  await expect(pageInTree).toHaveCount(1);
  await studioPage.removePage("UniversalPage");
  await expect(pageInTree).toHaveCount(0);
  await studioPage.save();
  expect(fs.existsSync("./src/pages/UniversalPage.tsx")).toBeFalsy();
});
