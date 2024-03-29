import useStudioStore from "../store/useStudioStore";
import getFunctionComponent from "./getFunctionComponent";
import dynamicImportFromBrowser from "./dynamicImportFromBrowser";
import {
  ComponentMetadata,
  FileMetadataKind,
  LayoutState,
  PageState,
} from "@yext/studio-plugin";

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
export function loadStyling(): Promise<void>[] {
  const studioStore = useStudioStore.getState();
  const addLoadedStyle = studioStore.loadedStyles.addLoadedStyleFilepath;
  const pages = Object.values(studioStore.pages.pages);
  const layouts = Object.values(studioStore.layouts.layoutNameToLayoutState);
  const fileMetadatas = Object.values(
    studioStore.fileMetadatas.UUIDToFileMetadata
  );
  const componentMetadatas = fileMetadatas.filter(
    (fileMetadata): fileMetadata is ComponentMetadata =>
      fileMetadata.kind === FileMetadataKind.Component
  );

  const userStyleFilepaths = getStyleImportsFromUserFiles([
    ...pages,
    ...layouts,
    ...componentMetadatas,
  ]);
  return userStyleFilepaths.map((filepath) => {
    return dynamicImportFromBrowser(filepath)
      .then((styling) => {
        const styleEl = document.createElement("style");
        styleEl.innerText = styling.default;
        styleEl.setAttribute(USER_CUSTOM_STYLE_ATTRIBUTE, filepath);
        document.head.appendChild(styleEl);
        styleEl.disabled = true;
      })
      .then(() => addLoadedStyle(filepath));
  });
}

function getStyleImportsFromUserFiles(
  styleImporters: (ComponentMetadata | PageState | LayoutState)[]
): string[] {
  const styleImports = styleImporters.flatMap(
    (importer) => importer.styleImports
  );
  return [...new Set(styleImports)];
}
