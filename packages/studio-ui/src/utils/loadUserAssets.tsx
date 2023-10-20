import useStudioStore from "../store/useStudioStore";
import getFunctionComponent from "./getFunctionComponent";
import dynamicImportFromBrowser from "./dynamicImportFromBrowser";
import { FileMetadataKind } from "@yext/studio-plugin";

export const USER_CUSTOM_STYLE_ATTRIBUTE = "studio-user-custom-style";

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
 * Load all user styling as disabled style tags in Studio's head.
 * Each style tags contains the styling file's contents and 
 * is labeled with the absolute path to the corresponding 
 * user styling file.
 */
export async function loadStyling() {
  const studioStore = useStudioStore.getState();
  const UUIDToFileMetadata = studioStore.fileMetadatas.UUIDToFileMetadata;
  const pages = studioStore.pages.pages;
  const layouts = studioStore.layouts.layoutNameToLayoutState;

  for (const fileMetadata of Object.values(UUIDToFileMetadata)) {
    if (fileMetadata.kind === FileMetadataKind.Component) {
      await importAndInjectIntoStudio(fileMetadata.cssImports);
    }
  }

  for (const page of Object.values(pages)) {
    await importAndInjectIntoStudio(page.cssImports);
  }

  for (const layout of Object.values(layouts)) {
    await importAndInjectIntoStudio(layout.cssImports);
  }
}

async function importAndInjectIntoStudio(cssImports: string[]) {
  for (const filepath of Object.values(cssImports)) {
    if (
      document.querySelector(`[${USER_CUSTOM_STYLE_ATTRIBUTE}='${filepath}']`)
    ) {
      return;
    }
    await dynamicImportFromBrowser(filepath).then((styling) => {
      const styleEl = document.createElement("style");
      styleEl.innerText = styling.default;
      styleEl.setAttribute(USER_CUSTOM_STYLE_ATTRIBUTE, filepath);
      document.head.appendChild(styleEl);
      styleEl.disabled = true;
    });
  }
}
