import { StudioData, StudioHMRPayload } from "@yext/studio-plugin";
import useStudioStore from "./useStudioStore";
import removeTopLevelFragments from "../utils/removeTopLevelFragments";

/**
 * A handler for custom Studio HMR events.
 * When a custom studio HMR event is received, updates the store.
 */
export default function hotReloadStore(payload: StudioHMRPayload) {
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
    store.studioConfig = studioData.studioConfig;
  });
}

function syncFileMetadata(studioData: StudioData) {
  const UUIDToFileMetadata = removeTopLevelFragments(
    studioData.UUIDToFileMetadata
  );
  useStudioStore.setState((store) => {
    store.fileMetadatas.UUIDToFileMetadata = UUIDToFileMetadata;
    store.previousSave.fileMetadatas.UUIDToFileMetadata = UUIDToFileMetadata;
  });
}

function syncPages(studioData: StudioData) {
  const pageNameToPageState = removeTopLevelFragments(
    studioData.pageNameToPageState
  );
  useStudioStore.setState((store) => {
    store.pages.pages = pageNameToPageState;
    store.pages.pendingChanges.pagesToRemove = new Set();
    store.pages.pendingChanges.pagesToUpdate = new Set();
    store.pages.activeComponentUUID = undefined;
  });
}

function syncSiteSettings(studioData: StudioData) {
  useStudioStore.setState((store) => {
    store.siteSettings.shape = studioData.siteSettings?.shape;
    store.siteSettings.values = studioData.siteSettings?.values;
    store.previousSave.siteSettings.values = studioData.siteSettings?.values;
  });
}
