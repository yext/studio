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
  readonly removeElementButton: Locator;
  readonly livePreviewButton: Locator;
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

    this.removeElementButton = page.getByRole("button", {
      name: "Remove Element",
    });

    this.livePreviewButton = page.getByRole("link", {
      name: "Live Preview",
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
    await this.takePageScreenshotAfterImgRender();
    await this.clickModalButton(pageTypeModal, "Next");
  }

  private async enterStreamScope(streamScopeForm?: StreamScopeForm) {
    const streamScopeModal = "Content Scope";
    const streamScopeTextboxNames: StreamScopeForm = {
      entityIds: "Entity IDs",
      entityTypes: "Entity Type IDs",
      savedFilterIds: "Saved Filter IDs",
    };
    await this.takePageScreenshotAfterImgRender();
    for (const field in streamScopeForm) {
      await this.typeIntoModal(
        streamScopeModal,
        streamScopeTextboxNames[field],
        streamScopeForm[field]
      );
    }
    await this.takePageScreenshotAfterImgRender();
    await this.clickModalButton(streamScopeModal, "Next");
  }

  private async enterBasicPageData(pageName: string, urlSlug?: string) {
    const basicDataModal = "Page Name and URL";
    await this.takePageScreenshotAfterImgRender();
    await this.typeIntoModal(basicDataModal, "Page Name", pageName);
    if (urlSlug) {
      await this.typeIntoModal(basicDataModal, "URL Slug", urlSlug);
    }
    await this.takePageScreenshotAfterImgRender();
    await this.clickModalButton(basicDataModal, "Save");
    await this.page.getByRole("dialog").waitFor({ state: "hidden" });
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

  private async waitForIFrameImagesToLoad() {
    const images = await this.preview.getByRole("img").all();
    const imgPromises = images.map((img) =>
      expect
        .poll(() => img.evaluate((e: HTMLImageElement) => e.complete), {
          message: "Wait for images in page preview to render.",
          timeout: 1000,
        })
        .toBeTruthy()
    );
    await Promise.all(imgPromises);
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
    await this.takePageScreenshotAfterImgRender();
    await this.page
      .getByRole("dialog", {
        name: "Delete Page Modal",
      })
      .getByRole("button", { name: "Delete" })
      .click();
  }

  async addElement(
    elementName: string,
    category: "Components" | "Layouts" | "Modules",
    shouldTakeScreenshots = true
  ) {
    await this.openAddElementMenu(category, shouldTakeScreenshots);
    await this.getAddElementLocator(elementName).click();
  }

  async openAddElementMenu(
    category: "Components" | "Layouts" | "Modules" = "Components",
    shouldTakeScreenshots = false
  ) {
    const takeScreenshot = () =>
      shouldTakeScreenshots && this.takePageScreenshotAfterImgRender();
    await this.addElementButton.click();
    await takeScreenshot();

    const categoryButton = this.page.getByRole("button", { name: category });
    if (await categoryButton.isEnabled()) {
      await categoryButton.click();
      await takeScreenshot();
    }
  }

  getAddElementLocator(elementName: string) {
    return this.page.getByRole("button", {
      name: `Add ${elementName} Element`,
    });
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

  getPropInput(propName: string) {
    return this.page.getByRole("textbox", { name: propName });
  }

  async getStringPropValue(
    propName: string,
    componentName: string,
    componentIndex?: number
  ) {
    await this.setActiveComponent(componentName, componentIndex);
    await this.page.getByRole("button", { name: "Props" }).click();
    const input = this.getPropInput(propName);
    return input.getAttribute("value");
  }

  getPagePath(pageName: string) {
    return path.join(this.tmpDir, "src/templates", pageName + ".tsx");
  }

  getComponentPath(componentName: string) {
    return path.join(this.tmpDir, "src/components", componentName + ".tsx");
  }


  async takePageScreenshotAfterImgRender() {
    await this.waitForIFrameImagesToLoad();
    await expect(this.page).toHaveScreenshot();
  }

  async takePreviewScreenshotAfterImgRender() {
    await this.waitForIFrameImagesToLoad();
    await expect(this.preview.locator("body")).toHaveScreenshot();
  }
}
