import { StudioData, StudioHMRPayload } from "@yext/studio-plugin";
import type useStudioStore from "./useStudioStore";

export default function syncStudioStore(
  payload: StudioHMRPayload,
  useStore: typeof useStudioStore
) {
  const { updateType, studioData } = payload;
  switch (updateType) {
    case "components":
    case "modules":
      syncFileMetadata(studioData, useStore);
      break;
    case "pages":
      syncPages(studioData, useStore);
      break;
    case "siteSettings":
      syncSiteSettings(studioData, useStore);
      break;
    default:
      fullSync(studioData, useStore);
      break;
  }
}

function fullSync(studioData: StudioData, useStore: typeof useStudioStore) {
  syncPages(studioData, useStore);
  syncFileMetadata(studioData, useStore);
  syncSiteSettings(studioData, useStore);
  useStore.setState((store) => {
    store.studioConfig.paths = studioData.userPaths;
  });
}

function syncFileMetadata(
  studioData: StudioData,
  useStore: typeof useStudioStore
) {
  useStore.setState((store) => {
    store.fileMetadatas.UUIDToFileMetadata = studioData.UUIDToFileMetadata;
  });
}

function syncPages(studioData: StudioData, useStore: typeof useStudioStore) {
  useStore.setState((store) => {
    store.pages.pages = studioData.pageNameToPageState;
  });
}

function syncSiteSettings(
  studioData: StudioData,
  useStore: typeof useStudioStore
) {
  useStore.setState((store) => {
    store.siteSettings.shape = studioData.siteSettings?.shape;
    store.siteSettings.values = studioData.siteSettings?.values;
  });
}
