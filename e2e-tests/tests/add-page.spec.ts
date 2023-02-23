import { expect } from "@playwright/test";
import { studioTest } from "./infra/studioTest.js";

studioTest("can add a new page", async ({ page, studioPage }) => {
  const newPageInTree = page.getByText("MyNewPage");
  await expect.poll(() => newPageInTree.count()).toBe(0);
  await studioPage.addPage("MyNewPage");
  await expect.poll(() => newPageInTree.count()).toBe(1);
});
