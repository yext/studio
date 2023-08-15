import { expect } from "@playwright/test";
import { studioTest } from "../infra/studioTest.js";
import fs from "fs";

const newComponent = `export default function SuperNewPage() { return <div>hi</div> };`;

studioTest("HMR for adding a page", async ({ studioPage }) => {
  const addElementLocator = studioPage.pagesPanel.getByText("SuperNewPage");
  await expect(addElementLocator).toHaveCount(0);
  fs.writeFileSync(studioPage.getPagePath("SuperNewPage"), newComponent);
  await expect(addElementLocator).toHaveCount(1);
});
