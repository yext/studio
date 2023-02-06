import { StudioData } from "@yext/studio-plugin";
import { StudioHMRPayload } from "@yext/studio-plugin";
import useStudioStore from "./useStudioStore";

export default function registerCustomHMR() {
  if (import.meta.hot) {
    import.meta.hot.on("studio:update", (hmrPayload: StudioHMRPayload) => {
      const { updateType, studioData } = hmrPayload;
      switch (updateType) {
        case "components":
        case "modules":
          syncFileMetadata(studioData);
          break;
        case "pages":
          syncPages(studioData);
          break;
        case "siteSettings":
          syncSiteSettings(studioData);
          break;
        default:
          syncPages(studioData);
          syncFileMetadata(studioData);
          syncSiteSettings(studioData);
          break;
      }
    });
  }
}

function syncFileMetadata(studioData: StudioData) {
  useStudioStore.setState((store) => {
    store.fileMetadatas.UUIDToFileMetadata = studioData.UUIDToFileMetadata;
  });
}

function syncPages(studioData: StudioData) {
  useStudioStore.setState((store) => {
    store.pages.pages = studioData.pageNameToPageState;
  });
}

function syncSiteSettings(studioData: StudioData) {
  useStudioStore.setState((store) => {
    store.siteSettings.shape = studioData.siteSettings?.shape;
    store.siteSettings.values = studioData.siteSettings?.values;
  });
}
