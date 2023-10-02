import { Page, expect } from "@playwright/test";

/**
 * A Playwright wrapper around the Viewport Selection functionality.
 */
export default class ViewportMenuSection {
  constructor(private page: Page) {};

  async openViewportMenu() {
    await this.page
      .getByRole("button", { name: "See Available Viewports" })
      .click();
  }

  async setViewport(viewportName: string) {
    await this.page
      .getByRole("button", { name: `Select ${viewportName} Viewport` })
      .click();
  }

  async takeScreenshot() {
    await expect(this.page.getByTestId("viewport-selection")).toHaveScreenshot();
  }
}
