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
export default function useInjectUserStyles(
  iframeDocument: Document | undefined
) {
  const userCssImports = useStudioStore(
    (store) => getUserCssImports(store),
    isEqual
  );

  useEffect(() => {
    if (!iframeDocument) {
      return;
    }
    userCssImports.forEach((cssFilepath) => {
      injectStyleIntoIframe(iframeDocument, cssFilepath);
    });

    return () => {
      clearStylingFromIframe(iframeDocument);
    };
  }, [iframeDocument, userCssImports]);
}

function getUserCssImports(store: StudioStore): string[] {
  const pageCss = store.pages.getActivePageState()?.cssImports ?? [];
  const componentTree = store.actions.getComponentTree();
  const getComponentMetadata = store.actions.getComponentMetadata;

  const componentTreeCss = new Set<string>();
  componentTree?.forEach((component) => {
    const cssImports = getComponentMetadata(component)?.cssImports;
    cssImports?.forEach((cssFilepath) => {
      componentTreeCss.add(cssFilepath);
    });
  });
  return [...componentTreeCss, ...pageCss];
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
  const oldIframeStyletag = iframeDocument.querySelector(styletagIdAttribute);
  if (!parentDocumentStyletag) {
    console.warn(
      `${filepath} was not able to be loaded into the Studio Preview. ` +
        "If this is a newly added CSS file, refresh Studio to update. " +
        "Note that unsaved changes will be deleted on page refresh."
    );
    return;
  }

  if (!oldIframeStyletag) {
    const newIframeStyletag = parentDocumentStyletag.cloneNode(true);
    iframeDocument.head.appendChild(newIframeStyletag);
  }
}
