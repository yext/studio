import { StudioData } from "@yext/studio-plugin";
import useStudioStore from "./useStudioStore";

export default function registerCustomHMR() {
  if (import.meta.hot) {
    import.meta.hot.on('studio:update', (studioData?: StudioData) => {
      if (studioData) {
        syncStudioData(studioData)
      }
    })
  }
}

function syncStudioData(studioData: StudioData) {
  useStudioStore.setState(store => {
    store.fileMetadatas.UUIDToFileMetadata = studioData.UUIDToFileMetadata
    store.pages.pages = studioData.pageNameToPageState;
    if (!store.pages.activePageName) {
      const firstPageEntry = Object.entries(
        studioData.pageNameToPageState
      )?.[0];
      store.pages.activePageName = firstPageEntry?.[0];
    }
    if (!store.pages.activeEntityFile) {
      const activePageState = studioData.pageNameToPageState[store.pages.activePageName];
      store.pages.activeEntityFile = activePageState?.["entityFiles"]?.[0];
    } 
    store.siteSettings.shape = studioData.siteSettings?.shape;
    store.siteSettings.values = studioData.siteSettings?.values;
  });
}