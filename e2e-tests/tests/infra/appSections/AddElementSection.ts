import { Locator, Page, expect } from "@playwright/test";

type ElementType = "Components" | "Containers" | "Layouts";

/**
 * A Playwright wrapper around the Add Element functionality.
 */
export default class AddElementSection {
  private addElementButton;
  private addElementMenu;
  private isMenuOpen;

  constructor(private page: Page) {
    this.addElementButton = page.getByRole("button", {
      name: "Open Add Element Menu",
    });
    this.addElementMenu = page.getByTestId("add-element-menu");
    this.isMenuOpen = false;
  }

  getAddElementLocator(elementName: string): Locator {
    return this.page.getByRole("button", {
      name: `Add ${elementName} Element`,
    });
  }

  async toggleAddElementMenu() {
    await this.addElementButton.click();
    this.isMenuOpen = !this.isMenuOpen;
  }

  private async selectElementType(elementType?: ElementType) {
    if (!this.isMenuOpen) {
      await this.toggleAddElementMenu();
    }

    if (elementType) {
      const categoryButton = this.page.getByRole("button", { name: elementType });
      await categoryButton.click();
    }
  }

  async addComponent(componentName: string) {
    await this.selectElementType();
    const addElementLocator = this.getAddElementLocator(componentName);
    await addElementLocator.click();
  }

  async addContainer(containerName: string) {
    await this.selectElementType("Containers");
    const addElementLocator = this.getAddElementLocator(containerName);
    await addElementLocator.click();
  }

  async takeScreenshot() {
    await expect(this.addElementMenu).toHaveScreenshot();
  }
}
