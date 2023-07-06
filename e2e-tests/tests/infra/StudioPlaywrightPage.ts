import { Locator, Page, expect } from "@playwright/test";
import ToastActionButton from "./ToastActionButton.js";
import { StreamScope } from "@yext/studio-plugin";

export type StreamScopeForm = {
  [key in keyof StreamScope]: string;
};

export default class StudioPlaywrightPage {
  readonly addPageButton: Locator;
  readonly pagesPanel: Locator;
  readonly componentTree: Locator;
  readonly addElementButton: Locator;
  readonly removeElementButton: Locator;
  readonly saveButton: ToastActionButton;
  readonly deployButton: ToastActionButton;

  constructor(private page: Page) {
    this.addPageButton = page.getByRole("button", {
      name: "Add Page",
    });

    this.pagesPanel = page.locator(':text("Pages") + ul');
    this.componentTree = page.locator(':text("Layers") + ul');

    this.addElementButton = page.getByRole("button", {
      name: "Open Add Element Menu",
    });

    this.removeElementButton = page.getByRole("button", {
      name: "Remove Element",
    });

    this.saveButton = new ToastActionButton(
      this.page,
      "Changes saved successfully.",
      "Save Changes to Repository"
    );

    this.deployButton = new ToastActionButton(
      this.page,
      "Deployed successfully.",
      "Deploy Changes to Repository"
    );
  }

  async addStaticPage(pageName: string, urlSlug: string) {
    await this.addPageButton.click();
    await this.selectPageType(false);
    await this.enterBasicData(pageName, urlSlug);
  }

  async addEntityPage(
    pageName: string,
    streamScopeForm: Required<StreamScopeForm>,
    urlSlug?: string
  ) {
    await this.addPageButton.click();
    await this.selectPageType(true);
    await this.enterStreamScope(streamScopeForm);
    await this.enterBasicData(pageName, urlSlug)
  }

  private async selectPageType(isEntityPage: boolean) {
    const pageTypeModal = "Select Page Type";
    if (isEntityPage) {
      await this.page.getByRole("radio", { checked: false }).check();
    }
    await expect(this.page).toHaveScreenshot();
    await this.clickModalButton(pageTypeModal, "Next");
  }

  private async enterStreamScope(streamScopeForm: Required<StreamScopeForm>) {
    const streamScopeModal = "Specify the Stream Scope";
    await expect(this.page).toHaveScreenshot();
    await this.typeIntoModal(
      streamScopeModal,
      "Entity IDs:",
      streamScopeForm.entityIds
    );
    await this.typeIntoModal(
      streamScopeModal,
      "Entity Types:",
      streamScopeForm.entityTypes
    );
    await this.typeIntoModal(
      streamScopeModal,
      "Saved Filter IDs:",
      streamScopeForm.savedFilterIds
    );
    await expect(this.page).toHaveScreenshot();
    await this.clickModalButton(streamScopeModal, "Next");
  }

  private async enterBasicData(pageName: string, urlSlug?: string) {
    const basicDataModal = "Specify Page Name and URL";
    await this.typeIntoModal(basicDataModal, "Give the page a name:", pageName);
    if (urlSlug)
      await this.typeIntoModal(
        basicDataModal,
        "Specify the URL slug:",
        urlSlug
      );
    await expect(this.page).toHaveScreenshot();
    await this.clickModalButton(basicDataModal, "Save");
  }

  private async clickModalButton(modalName: string, buttonName: string) {
    const modal = this.page.getByRole("dialog", {
      name: modalName,
    });
    await modal
      .getByRole("button", {
        name: buttonName,
      })
      .click();
  }

  private async typeIntoModal(
    modalName: string,
    textboxName: string,
    text: string
  ) {
    const modal = this.page.getByRole("dialog", {
      name: modalName,
    });
    await modal
      .getByRole("textbox", {
        name: textboxName,
      })
      .fill(text);
  }

  async switchPage(pageName: string) {
    await this.pagesPanel
      .getByRole("button", {
        name: pageName,
        exact: true,
      })
      .click();
  }

  async removePage(pageName: string) {
    await this.pagesPanel
      .getByRole("listitem")
      .filter({ hasText: pageName })
      .getByRole("button", {
        name: "Remove Page",
      })
      .click();
    await expect(this.page).toHaveScreenshot();
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
    await expect(this.page).toHaveScreenshot();

    const categoryButton = this.page.getByRole("button", { name: category });
    if (await categoryButton.isEnabled()) {
      await categoryButton.click();
      await expect(this.page).toHaveScreenshot();
    }

    await this.page
      .getByRole("button", {
        name: `Add ${elementName} Element`,
      })
      .click();
  }

  async removeElement(elementName: string, index?: number) {
    await this.setActiveComponent(elementName, index);
    await this.removeElementButton.click();
  }

  async setActiveComponent(componentName: string, componentIndex = 0) {
    const component = this.componentTree
      .getByText(componentName)
      .nth(componentIndex);
    await component.click();
  }

  async getStringPropValue(
    propName: string,
    componentName: string,
    componentIndex?: number
  ) {
    await this.setActiveComponent(componentName, componentIndex);
    await this.page.getByRole("button", { name: "Props" }).click();
    const input = this.page.getByRole("textbox", { name: propName });
    return input.getAttribute("value");
  }
}
