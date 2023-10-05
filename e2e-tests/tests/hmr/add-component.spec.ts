import { expect } from "@playwright/test";
import { studioTest } from "../infra/studioTest.js";
import fs from "fs";

const newComponent = `export default function SuperNewComponent() { return <div>hi</div> };`;

studioTest("HMR for adding a component", async ({ studioPage }) => {
  const addElementSection = studioPage.addElementSection;

  const addElementLocator =
    addElementSection.getAddElementLocator("SuperNewComponent");
  await addElementSection.toggleAddElementMenu();
  await expect(addElementLocator).toHaveCount(0);
  fs.writeFileSync(
    studioPage.getComponentPath("SuperNewComponent"),
    newComponent
  );
  await expect(addElementLocator).toHaveCount(1);
});
