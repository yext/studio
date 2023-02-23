import { expect } from "@playwright/test";
import { studioTest } from "./infra/studioTest.js";

studioTest("can remove a page", async ({ page, studioPage }) => {
  const pageInTree = page.getByText("UniversalPage");
  await expect.poll(() => pageInTree.count()).toBe(1);
  await studioPage.removePage("UniversalPage");
  await expect.poll(() => pageInTree.count()).toBe(0);
});
