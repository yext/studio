import { useEffect } from "react";
import useStudioStore from "../store/useStudioStore";

export default function useInjectUserStyles(iframeDocument: Document | undefined) {
  const [
    componentTree,
    getComponentMetadata,
    activePage,
    UUIDToFileMetadata,
    pageCss,
  ] = useStudioStore((store) => [
    store.actions.getComponentTree(),
    store.actions.getComponentMetadata,
    store.pages.activePageName,
    store.fileMetadatas.UUIDToFileMetadata,
    store.pages.getActivePageState()?.cssImports,
  ]);
  useEffect(() => {
    if (!iframeDocument) {
      return;
    }
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
    componentTree,
    getComponentMetadata,
    iframeDocument,
    pageCss,
    activePage,
    UUIDToFileMetadata,
  ]);
}

function clearStylingFromIframe(iframeDocument: Document) {
  const styleElements = [...iframeDocument.head.getElementsByTagName("style")];
  styleElements.forEach((element) => {
    element.remove();
  });
}

function injectStyleIntoIframe(
  iframeDocument: Document,
  filepath: string
) {
  const originalStyletag = document.querySelector(
    `[studio-style-filepath='${filepath}']`
  );
  if (originalStyletag) {
    const iframeStyletag = originalStyletag.cloneNode(true);
    iframeDocument.head.appendChild(iframeStyletag);
  }
}