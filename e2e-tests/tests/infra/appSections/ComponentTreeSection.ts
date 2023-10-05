import { Locator, Page, expect } from "@playwright/test";

/**
 * A Playwright wrapper around the Component Tree functionality.
 * TODO: Add method to re-arrange Elements.
 */
export default class ComponentTreeSection {
  private componentTree: Locator;
  private removeElementButton: Locator;

  constructor(page: Page) {
    this.componentTree = page.locator(':text("Layers") + ul');
    this.removeElementButton = page.getByRole("button", {
      name: "Remove Element",
    });
  }

  getElement(name: string, index = 0): Locator {
    return this.componentTree.getByText(name).nth(index);
  }

  async setActiveElement(name: string, index = 0) {
    const component = this.getElement(name, index);
    await component.click();
  }

  async removeElement(name: string, index?: number) {
    await this.setActiveElement(name, index);
    await this.removeElementButton.click();
  }

  async takeScreenshot() {
    await expect(this.componentTree).toHaveScreenshot();
  }
}
