import { FrameLocator, Locator, Page, expect } from "@playwright/test";
import ToastActionButton from "./ToastActionButton.js";
import path from "path";
import GitOperations from "./GitOperations.js";
import simpleGit from "simple-git";
import { StreamScope } from "@yext/studio-plugin";

export type StreamScopeForm = {
  [key in keyof StreamScope]: string;
};

export default class StudioPlaywrightPage {
  readonly addPageButton: Locator;
  readonly pagesPanel: Locator;
  readonly componentTree: Locator;
  readonly addElementButton: Locator;
  readonly preview: FrameLocator;
  readonly saveButton: ToastActionButton;
  readonly deployButton: ToastActionButton;
  readonly gitOps: GitOperations;

  constructor(private page: Page, private tmpDir: string) {
    this.addPageButton = page.getByRole("button", {
      name: "Add Page",
    });

    this.pagesPanel = page.locator(':text("Pages") + ul');
    this.componentTree = page.locator(':text("Layers") + ul');

    this.addElementButton = page.getByRole("button", {
      name: "Open Add Element Menu",
    });

    this.preview = page.frameLocator('[title="PreviewPanel"]');

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

    const git = simpleGit(tmpDir);
    this.gitOps = new GitOperations(git);
  }

  async addStaticPage(pageName: string, urlSlug: string) {
    await this.addPageButton.click();
    await this.selectPageType(false);
    await this.enterBasicPageData(pageName, urlSlug);
  }

  async addEntityPage(
    pageName: string,
    streamScopeForm?: StreamScopeForm,
    urlSlug?: string
  ) {
    await this.addPageButton.click();
    await this.selectPageType(true);
    await this.enterStreamScope(streamScopeForm);
    await this.enterBasicPageData(pageName, urlSlug);
  }

  private async selectPageType(isEntityPage: boolean) {
    const pageTypeModal = "Select Page Type";
    if (isEntityPage) {
      await this.page.getByRole("radio", { checked: false }).check();
    }
    await expect(this.page).toHaveScreenshot();
    await this.clickModalButton(pageTypeModal, "Next");
  }

  private async enterStreamScope(streamScopeForm?: StreamScopeForm) {
    const streamScopeModal = "Content Scope";
    const streamScopeTextboxNames: StreamScopeForm = {
      entityIds: "Entity IDs",
      entityTypes: "Entity Type IDs",
      savedFilterIds: "Saved Filter IDs",
    };
    await expect(this.page).toHaveScreenshot();
    for (const field in streamScopeForm) {
      await this.typeIntoModal(
        streamScopeModal,
        streamScopeTextboxNames[field],
        streamScopeForm[field]
      );
    }
    await expect(this.page).toHaveScreenshot();
    await this.clickModalButton(streamScopeModal, "Next");
  }

  private async enterBasicPageData(pageName: string, urlSlug?: string) {
    const basicDataModal = "Page Name and URL";
    await expect(this.page).toHaveScreenshot();
    await this.typeIntoModal(basicDataModal, "Page Name", pageName);
    if (urlSlug) {
      await this.typeIntoModal(basicDataModal, "URL Slug", urlSlug);
    }
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
        name: "Remove Element",
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
    category: "Components" | "Layouts" | "Modules"
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

  async removeElement(elementName: string, hasText: string, index?: number) {
    const removeButton = this.page
      .getByRole("listitem")
      .filter({ hasText: hasText })
      .getByRole("button", { name: "Remove Element" });
    await this.setActiveComponent(elementName, index);
    await removeButton.click();
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

  getPagePath(pageName: string) {
    return path.join(this.tmpDir, "src/templates", pageName + ".tsx");
  }

  getComponentPath(componentName: string) {
    return path.join(this.tmpDir, "src/components", componentName + ".tsx");
  }
}
