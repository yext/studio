import { studioTest } from "./infra/studioTest.js";

studioTest("components with parsing errors", async ({ studioPage }) => {
  await studioPage.switchPage("ErrorComponentPreviews");
  await studioPage.takePageScreenshotAfterImgRender();

  await studioPage.preview
    .getByText(
      "We will still try our best to render this component even with a parsing error."
    )
    .first()
    .hover();
  await studioPage.takePageScreenshotAfterImgRender();

  await studioPage.componentTreeSection.setActiveElement("ErrorComponent");
  await studioPage.takePageScreenshotAfterImgRender();
});
