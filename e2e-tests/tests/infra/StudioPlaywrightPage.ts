import { Locator, Page, expect } from "@playwright/test";
import { ElementType } from "@yext/studio/src/components/AddElementMenu/AddElementMenu";

export default class StudioPlaywrightPage {
  readonly saveButton: Locator;
  readonly addPageButton: Locator;
  readonly pagesPanel: Locator;
  readonly addElementButton: Locator;

  constructor(private page: Page) {
    this.saveButton = page.getByRole("button", {
      exact: true,
      name: "Save Changes to Repository",
    });

    this.addPageButton = page.getByRole("button", {
      exact: true,
      name: "Add Page",
    });

    this.pagesPanel = page.locator(':text("Pages") + ul');

    this.addElementButton = page.getByRole("button", {
      exact: true,
      name: "Open Add Element Menu",
    });
  }

  async addPage(pageName: string) {
    await this.addPageButton.click();
    await this.screenshot();

    const modal = this.page.getByRole("dialog", {
      exact: true,
      name: "Add Page Modal",
    });
    await modal.getByRole("textbox").type(pageName);
    await modal.getByText("Save").click();
  }

  async removePage(pageName: string) {
    await this.pagesPanel
      .getByRole("listitem")
      .filter({ hasText: pageName })
      .getByRole("button", {
        name: "Remove Page",
      })
      .click();
    await this.screenshot();
    await this.page
      .getByRole("dialog", {
        exact: true,
        name: "Delete Page Modal",
      })
      .getByText("Delete", { exact: true })
      .click();
  }

  async addElement(elementName: string, category: ElementType) {
    await this.addElementButton.click();
    await this.screenshot();

    await this.page.getByText(category).click();
    await this.screenshot();

    await this.page
      .getByRole("button", {
        name: `Add ${elementName} Element`,
        exact: true,
      })
      .click();
  }

  private async screenshot() {
    await expect(this.page).toHaveScreenshot();
  }
}
