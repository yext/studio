import { expect } from "@playwright/test";
import { studioTest } from "./infra/studioTest.js";

studioTest("can add a new page", async ({ page, studioPage }) => {
  const newPageInTree = page.getByText("MyNewPage");
  await expect(newPageInTree).toHaveCount(0)
  await studioPage.addPage("MyNewPage");
  await expect(newPageInTree).toHaveCount(1)
});
