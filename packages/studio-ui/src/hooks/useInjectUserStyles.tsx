import { useEffect } from "react";
import useStudioStore from "../store/useStudioStore";

export const UserCustomStyletagAttribute = "studio-user-custom-style";

export default function useInjectUserStyles(
  iframeDocument: Document | undefined
) {
  const [componentTree, getComponentMetadata, UUIDToFileMetadata, pageCss] =
    useStudioStore((store) => [
      store.actions.getComponentTree(),
      store.actions.getComponentMetadata,
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
    getComponentMetadata,
    iframeDocument,
    UUIDToFileMetadata,
    componentTree,
    pageCss,
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
  if (!parentDocumentStyletag) {
    console.warn(
      `${filepath} was not able to be loaded into the Studio Preview. ` +
        "This is likely because it is a newly added CSS file. Refresh Studio to update."
    );
    return;
  }

  if (!oldIframeStyletag) {
    const newIframeStyletag = parentDocumentStyletag.cloneNode(true);
    iframeDocument.head.appendChild(newIframeStyletag);
  }
}
