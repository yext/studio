import { useEffect } from "react";
import useStudioStore from "../store/useStudioStore";

export const UserCustomStyletagAttribute = "studio-user-custom-style";

export default function useInjectUserStyles(
  iframeDocument: Document | undefined
) {
  const [getComponentMetadata, activePageState, UUIDToFileMetadata] =
    useStudioStore((store) => [
      store.actions.getComponentMetadata,
      store.pages.getActivePageState(),
      store.fileMetadatas.UUIDToFileMetadata,
    ]);
  useEffect(() => {
    if (!iframeDocument || !activePageState) {
      return;
    }

    const { componentTree, cssImports: pageCss } = activePageState;
    componentTree?.forEach((component) => {
      const cssImports = getComponentMetadata(component)?.cssImports;
      cssImports?.forEach((cssFilepath) => {
        injectStyleIntoIframe(iframeDocument, cssFilepath);
      });
    });
    pageCss?.forEach((cssFilepath) => {
      injectStyleIntoIframe(iframeDocument, cssFilepath);
    });

    return () => {
      clearStylingFromIframe(iframeDocument);
    };
  }, [
    getComponentMetadata,
    iframeDocument,
    UUIDToFileMetadata,
    activePageState,
  ]);
}

function clearStylingFromIframe(iframeDocument: Document) {
  const styleElements = [...iframeDocument.head.getElementsByTagName("style")];
  styleElements.forEach((element) => {
    element.remove();
  });
}

function injectStyleIntoIframe(iframeDocument: Document, filepath: string) {
  const styletagIdAttribute = `[${UserCustomStyletagAttribute}='${filepath}']`;
  const parentDocumentStyletag = document.querySelector(styletagIdAttribute);
  const oldIframeStyletag = iframeDocument.querySelector(styletagIdAttribute);

  if (parentDocumentStyletag && !oldIframeStyletag) {
    const newIframeStyletag = parentDocumentStyletag.cloneNode(true);
    iframeDocument.head.appendChild(newIframeStyletag);
  }
}
