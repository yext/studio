import { FrameLocator, Locator, Page, expect } from "@playwright/test";
import ToastActionButton from "./ToastActionButton.js";
import path from "path";
import GitOperations from "./GitOperations.js";
import simpleGit from "simple-git";
import ViewportMenuSection from "./appSections/ViewportMenuSection.js";
import AddElementSection from "./appSections/AddElementSection.js";
import ComponentTreeSection from "./appSections/ComponentTreeSection.js";
import AddPageSection from "./appSections/AddPageSection.js";

export default class StudioPlaywrightPage {
  readonly pagesPanel: Locator;
  readonly livePreviewButton: Locator;
  readonly preview: FrameLocator;
  readonly saveButton: ToastActionButton;
  readonly deployButton: ToastActionButton;
  readonly gitOps: GitOperations;
  readonly viewportMenuSection: ViewportMenuSection;
  readonly addElementSection: AddElementSection;
  readonly componentTreeSection: ComponentTreeSection;
  readonly addPageSection: AddPageSection;

  constructor(private page: Page, private tmpDir: string) {
    this.pagesPanel = page.locator(':text("Pages") + ul');
    this.livePreviewButton = page.getByRole("button", {
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

    this.viewportMenuSection = new ViewportMenuSection(this.page);
    this.addElementSection = new AddElementSection(this.page);
    this.componentTreeSection = new ComponentTreeSection(this.page);
    this.addPageSection = new AddPageSection(this.page);
  }

  private async waitForIFrameImagesToLoad() {
    const images = await this.preview.getByRole("img").all();
    const imgPromises = images.map((img) =>
      expect
        .poll(() => img.evaluate((e: HTMLImageElement) => e.complete), {
          message: "Wait for images in page preview to render.",
          timeout: 5000,
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

  getPropInput(propName: string) {
    return this.page.getByRole("textbox", { name: propName });
  }

  async getStringPropValue(
    propName: string,
    componentName: string,
    componentIndex?: number
  ) {
    await this.componentTreeSection.setActiveElement(
      componentName,
      componentIndex
    );
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

  async reload() {
    await this.page.reload();
    await this.waitForLoadState();
  }

  /**
   * Waits for the LoadingOverlay to finish.
   */
  async waitForLoadState() {
    await this.page.waitForLoadState();
    const overlayDomEl = this.page.getByTestId("loading-overlay")
    await expect.poll(() => overlayDomEl.evaluate((e: HTMLElement) => {
       console.log(e.className)
      return e.className.includes("opacity-0")
    }), {
      message: "Waiting for LoadingOverlay to finish.",
      timeout: 5000,
    }).toBeTruthy()
    console.log("TRUTHED!")
  }
}
