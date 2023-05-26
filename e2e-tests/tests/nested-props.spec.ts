import { expect } from "@playwright/test";
import { studioTest } from "./infra/studioTest";

studioTest('renders nested props', async ({ page, studioPage }) => {
  studioPage.setActiveComponent('Banner');
  await expect(page.getByTestId('EditorSidebar')).toHaveScreenshot();
});