import useStudioStore from "../store/useStudioStore";
import getFunctionComponent from "./getFunctionComponent";
import dynamicImportFromBrowser from "./dynamicImportFromBrowser";
import { FileMetadataKind } from "@yext/studio-plugin";
import { UserCustomStyletagAttribute } from "../hooks/useInjectUserStyles";

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
    if (document.querySelector(`[${UserCustomStyletagAttribute}='${filepath}']`)) {
      return;
    }
    await dynamicImportFromBrowser(filepath).then((styling) => {
      const styleEl = document.createElement("style");
      styleEl.innerText = styling.default;
      styleEl.setAttribute(UserCustomStyletagAttribute, filepath);
      document.head.appendChild(styleEl);
      styleEl.disabled = true;
    });
  }
}
