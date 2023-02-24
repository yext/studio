import { expect } from "@playwright/test";
import { studioTest } from "./infra/studioTest.js";

const expectedPagePath = "./src/pages/MyNewPage.tsx";
const expectedNewPage = "export default function MyNewPage() {}";

studioTest("can add a new page", async ({ page, studioPage }) => {
  const newPageInTree = page.getByText("MyNewPage");
  await expect(newPageInTree).toHaveCount(0);
  await studioPage.addPage("MyNewPage");
  await expect(newPageInTree).toHaveCount(1);
  await studioPage.screenshot();
  await studioPage.save();
  await expect(expectedPagePath).toHaveContents(expectedNewPage);
});
