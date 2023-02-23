import { expect } from "@playwright/test";
import { ElementType } from "@yext/studio/lib/src/components/AddElementMenu/AddElementMenu";
import { studioTest } from "./infra/studioTest";

studioTest("can add a container component", async ({ page, studioPage }) => {
  const previews = page.getByText("I'm a container:");
  await expect.poll(() => previews.count()).toBe(1);
  await studioPage.addElement("Container", ElementType.Containers);
  await expect.poll(() => previews.count()).toBe(2);
});
