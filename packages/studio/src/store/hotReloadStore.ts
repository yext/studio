import { StudioData, StudioHMRPayload } from "@yext/studio-plugin";
import useStudioStore from "./useStudioStore";
import removeTopLevelFragments from "../utils/removeTopLevelFragments";
import dynamicImportFromBrowser from "../utils/dynamicImportFromBrowser";
import path from "path-browserify";
import getFunctionComponent from "../utils/getFunctionComponent";

/**
 * A handler for custom Studio HMR events.
 * When a custom studio HMR event is received, updates the store.
 */
export default async function hotReloadStore(payload: StudioHMRPayload) {
  const { updateType, studioData } = payload;
  switch (updateType) {
    case "components":
      await syncFileMetadata(studioData, payload.file);
      break;
    case "layouts":
      // TODO SLAP-2927
      break;
    case "pages":
      syncPages(studioData);
      break;
    case "siteSettings":
      syncSiteSettings(studioData);
      break;
    default:
      await fullSync(studioData, payload.file);
      break;
  }
}

async function fullSync(studioData: StudioData, file: string) {
  syncPages(studioData);
  await syncFileMetadata(studioData, file);
  syncSiteSettings(studioData);
  useStudioStore.setState((store) => {
    store.studioConfig = studioData.studioConfig;
  });
}

async function syncFileMetadata(studioData: StudioData, file: string) {
  const UUIDToFileMetadata = removeTopLevelFragments(
    studioData.UUIDToFileMetadata
  );
  useStudioStore.setState((store) => {
    store.fileMetadatas.UUIDToFileMetadata = UUIDToFileMetadata;
    store.previousSave.fileMetadatas.UUIDToFileMetadata = UUIDToFileMetadata;
  });
  const fileMetadata = Object.values(UUIDToFileMetadata).find(
    (metadata) => metadata.filepath === file
  );
  if (!fileMetadata) {
    return;
  }

  const importedFile = await dynamicImportFromBrowser(
    file + `?timestamp=${Date.now()}`
  );
  const componentFunction = getFunctionComponent(
    importedFile,
    path.basename(file, ".tsx")
  );
  if (componentFunction) {
    useStudioStore
      .getState()
      .fileMetadatas.setImportedComponent(
        fileMetadata.metadataUUID,
        componentFunction
      );
  }
}

function syncPages(studioData: StudioData) {
  const pageNameToPageState = removeTopLevelFragments(
    studioData.pageNameToPageState
  );
  useStudioStore.setState((store) => {
    store.pages.pages = pageNameToPageState;
    store.pages.errorPages = studioData.pageNameToErrorPageState;
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
