import { useEffect } from "react";
import useStudioStore from "../store/useStudioStore";
import { USER_CUSTOM_STYLE_ATTRIBUTE } from "../utils/loadUserAssets";
import isEqual from "lodash/isEqual";
import { StudioStore } from "../store/models/StudioStore";

/**
 * This hook injects user styling from the Studio document head into the
 * Studio Preview iframe's document head.  It only injects the relevant
 * styling of the current active page and component tree.  Styling is cleared
 * from the iframe before each injection.
 */
export default function useInjectActiveStyles(
  iframeDocument: Document | undefined
) {
  const [activeStylesFilepaths, loadedStyleFilepaths] = useStudioStore(
    (store) => [
      getFilepathsOfActiveStyles(store),
      store.loadedStyles.loadedStyleFilepaths,
    ],
    isEqual
  );

  useEffect(() => {
    if (!iframeDocument) {
      return;
    }
    activeStylesFilepaths.forEach((styleFilepath) => {
      injectStyleIntoIframe(iframeDocument, styleFilepath);
    });

    return () => {
      clearStylingFromIframe(iframeDocument);
    };

    /**
     * loadedStyleFilepaths is watched by this useEffect hook to
     * account for the race condition where this hook is
     * called before all user styles are added to Studio's
     * document head.
     */
  }, [iframeDocument, activeStylesFilepaths, loadedStyleFilepaths]);
}

function getFilepathsOfActiveStyles(store: StudioStore): string[] {
  const activePageStyles = store.pages.getActivePageState()?.styleImports ?? [];
  const componentTree = store.actions.getComponentTree();
  const getComponentMetadata = store.actions.getComponentMetadata;

  const componentTreeStyles = new Set<string>();
  componentTree?.forEach((component) => {
    const styleImports = getComponentMetadata(component)?.styleImports;
    styleImports?.forEach((styleFilepath) => {
      componentTreeStyles.add(styleFilepath);
    });
  });
  return [...componentTreeStyles, ...activePageStyles];
}

function clearStylingFromIframe(iframeDocument: Document) {
  const styleElements = [...iframeDocument.head.getElementsByTagName("style")];
  styleElements.forEach((element) => {
    element.remove();
  });
}

function injectStyleIntoIframe(iframeDocument: Document, filepath: string) {
  const styletagIdAttribute = `[${USER_CUSTOM_STYLE_ATTRIBUTE}='${filepath}']`;
  const parentDocumentStyletag = document.querySelector(styletagIdAttribute);
  const existingIframeStyletag =
    iframeDocument.querySelector(styletagIdAttribute);
  if (existingIframeStyletag) {
    return;
  }

  if (!parentDocumentStyletag) {
    console.warn(
      `${filepath} was not able to be loaded into the Studio Preview. ` +
        "If this style is missing from Studio Preview and is a " +
        "newly added style file, refresh Studio to update. Note that " +
        "unsaved changes will not be preserved on page refresh."
    );
    return;
  }
  const newIframeStyletag = parentDocumentStyletag.cloneNode(true);
  iframeDocument.head.appendChild(newIframeStyletag);
}
