import { Page, expect } from "@playwright/test";

/**
 * A Playwright wrapper around the Add Page flow.
 */
export default class AddPageSection {
  private addPageButton;
  private modalScreen;

  constructor(private page: Page) {
    this.addPageButton = page.getByRole("button", {
      name: "Add Page",
    });
  }

  async selectPageType(isEntityPage: boolean, shouldTakeSnapshot = false) {
    await this.addPageButton.click();
    this.setModalScreen("Select Page Type");
    if (isEntityPage) {
      await this.page.getByRole("radio", { checked: false }).check();
    }
    shouldTakeSnapshot && (await this.takeScreenshot());
    await this.clickModalButton("Next");
  }

  async enterBasicPageData(
    pageName: string,
    urlSlug?: string,
    shouldTakeSnapshot = false
  ) {
    this.setModalScreen("Page Name and URL");
    await this.typeIntoModal("Page Name", pageName);
    if (urlSlug) {
      await this.typeIntoModal("URL Slug", urlSlug);
    }
    shouldTakeSnapshot && (await this.takeScreenshot());
    await this.clickModalButton("Next");
  }

  async selectLayout(layoutName?: string, shouldTakeSnapshot = false) {
    this.setModalScreen("Select Layout");
    if (layoutName) {
      await this.modalScreen
        .getByRole("combobox")
        .selectOption({ label: layoutName });
    }
    shouldTakeSnapshot && (await this.takeScreenshot());
    await this.clickModalButton("Save");
    await this.page.getByRole("dialog").waitFor({ state: "hidden" });
  }

  async takeScreenshot() {
    await expect(this.modalScreen).toHaveScreenshot();
  }

  private setModalScreen(screenName: string) {
    this.modalScreen = this.page.getByRole("dialog", { name: screenName });
  }

  private async clickModalButton(buttonName: string) {
    await this.modalScreen
      .getByRole("button", {
        name: buttonName,
      })
      .click();
  }

  private async typeIntoModal(textboxName: string, text: string) {
    await this.modalScreen
      .getByRole("textbox", {
        name: textboxName,
      })
      .fill(text);
  }
}
