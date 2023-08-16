import { expect } from "@playwright/test";
import { studioTest } from "../infra/studioTest.js";
import fs from "fs";

studioTest("HMR for removing a page", async ({ studioPage }) => {
  const basicPage = studioPage.pagesPanel.getByText("BasicPage");
  await expect(basicPage).toHaveCount(1);
  fs.rmSync(studioPage.getPagePath("BasicPage"));
  await expect(basicPage).toHaveCount(0);
});
