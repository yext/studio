import { expect } from "@playwright/test";
import { studioTest } from "./infra/studioTest.js";

studioTest("can add a container component", async ({ page, studioPage }) => {
  const previews = page.getByText("I'm a container:");
  await expect.poll(() => previews.count()).toBe(1);
  await studioPage.addElement("Container", "Containers");
  await expect.poll(() => previews.count()).toBe(2);
});
