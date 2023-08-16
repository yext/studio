import { expect } from "@playwright/test";
import { studioTest } from "../infra/studioTest.js";
import fs from "fs";

const newComponent = `export default function SuperNewComponent() { return <div>hi</div> };`;

studioTest("HMR for adding a component", async ({ studioPage }) => {
  const addElementLocator =
    studioPage.getAddElementLocator("SuperNewComponent");
  await studioPage.openAddElementMenu();
  await expect(addElementLocator).toHaveCount(0);
  fs.writeFileSync(
    studioPage.getComponentPath("SuperNewComponent"),
    newComponent
  );
  await expect(addElementLocator).toHaveCount(1);
});
