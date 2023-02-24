import { Locator, Page, expect } from "@playwright/test";

export default class StudioPlaywrightPage {
  readonly saveButton: Locator;
  readonly addPageButton: Locator;
  readonly pagesPanel: Locator;
  readonly addElementButton: Locator;
  readonly successToast: Locator;

  constructor(private page: Page) {
    this.saveButton = page.getByRole("button", {
      name: "Save Changes to Repository",
    });

    this.addPageButton = page.getByRole("button", {
      name: "Add Page",
    });

    this.pagesPanel = page.locator(':text("Pages") + ul');

    this.addElementButton = page.getByRole("button", {
      name: "Open Add Element Menu",
    });

    this.successToast = page
      .getByRole("alert")
      .filter({ hasText: "Changes saved successfully." });
  }

  async addPage(pageName: string) {
    await this.addPageButton.click();
    await this.screenshot();

    const modal = this.page.getByRole("dialog", {
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
        name: "Delete Page Modal",
      })
      .getByRole("button", { name: "Delete" })
      .click();
  }

  async addElement(
    elementName: string,
    category: "Components" | "Containers" | "Modules"
  ) {
    await this.addElementButton.click();
    await this.screenshot();

    await this.page.getByText(category).click();
    await this.screenshot();

    await this.page
      .getByRole("button", {
        name: `Add ${elementName} Element`,
      })
      .click();
  }

  async save() {
    void this.saveButton.click();
    await expect(this.successToast).toHaveCount(1);
    void this.successToast.click();
    await expect(this.successToast).toHaveCount(0);
  }

  async screenshot() {
    await expect(this.page).toHaveScreenshot();
  }
}
