import useStudioStore from "../store/useStudioStore";
import getFunctionComponent from "./getFunctionComponent";
import dynamicImportFromBrowser from "./dynamicImportFromBrowser";
import { FileMetadataKind } from "@yext/studio-plugin";

/**
 * Load all of the user's components into the store.
 */
export function loadComponents(): Promise<void>[] {
  const { UUIDToFileMetadata, setImportedComponent, UUIDToImportedComponent } =
    useStudioStore.getState().fileMetadatas;

  const componentImportPromises = Object.values(UUIDToFileMetadata).map(
    async (fileMetadata) => {
      if (UUIDToImportedComponent.hasOwnProperty(fileMetadata.metadataUUID)) {
        return;
      }
      const importedModule = await dynamicImportFromBrowser(
        fileMetadata.filepath
      );
      const functionComponent = getFunctionComponent(importedModule);
      if (functionComponent) {
        setImportedComponent(fileMetadata.metadataUUID, functionComponent);
      }
    }
  );
  return componentImportPromises;
}

/**
 * Load all user styling as disabled style tags in Studio's iframe.
 */
export function loadStyling() {
  const studioStore = useStudioStore.getState()
  const UUIDToFileMetadata = studioStore.fileMetadatas.UUIDToFileMetadata
  const pages = studioStore.pages.pages

  Object.values(UUIDToFileMetadata).forEach(
    (fileMetadata) => {
      if (fileMetadata.kind === FileMetadataKind.Component) {
        importAndInjectIntoStudio(fileMetadata.cssImports);
      }
    }
  );

  Object.values(pages).forEach(
    (page) => {
      importAndInjectIntoStudio(page.cssImports);
    }
  );
}

function importAndInjectIntoStudio(cssImports: string[]) {
  cssImports.forEach(async (filepath) => {
    await dynamicImportFromBrowser(
      filepath
    ).then((styling) => {
      if (document.querySelector(`[studio-style-filepath='${filepath}']`)){
        return
      }
      const styleEl = document.createElement("style")
      styleEl.innerText = styling.default;
      styleEl.setAttribute("studio-style-filepath", filepath)
      document.head.appendChild(styleEl)
      styleEl.disabled = true;
    });
  })
}
