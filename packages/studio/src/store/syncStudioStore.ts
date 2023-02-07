import { StudioData, StudioHMRPayload } from "@yext/studio-plugin";
import useStudioStore from "./useStudioStore";

export default function syncStudioStore(payload: StudioHMRPayload) {
  const { updateType, studioData } = payload;
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
      fullSync(studioData);
      break;
  }
}

function fullSync(studioData: StudioData) {
  syncPages(studioData);
  syncFileMetadata(studioData);
  syncSiteSettings(studioData);
  useStudioStore.setState((store) => {
    store.studioConfig.paths = studioData.userPaths;
  });
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
