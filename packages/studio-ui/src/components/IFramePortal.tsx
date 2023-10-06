import { createPortal } from "react-dom";
import {
  Dispatch,
  PropsWithChildren,
  RefObject,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";
import useStudioStore from "../store/useStudioStore";
import { twMerge } from "tailwind-merge";
import { Viewport } from "./Viewport/defaults";
import dynamicImportFromBrowser from "../utils/dynamicImportFromBrowser";

export default function IFramePortal(
  props: PropsWithChildren<{
    title: string;
    iframeEl: HTMLIFrameElement | null;
    setIframeEl: Dispatch<SetStateAction<HTMLIFrameElement | null>>;
  }>
) {
  const previewRef = useRef<HTMLDivElement>(null);
  const iframeDocument = props.iframeEl?.contentWindow?.document;
  useInjectIframeCss(iframeDocument);

  const [viewport] = useStudioStore((store) => [store.pagePreview.viewport]);
  const iframeCSS = twMerge(
    "mr-auto ml-auto border-2",
    viewport.css,
    useViewportOption(viewport, previewRef)
  );

  return (
    <div ref={previewRef} className="grow w-1/3 bg-white border-8 shadow">
      <iframe
        id="iframe"
        title={props.title}
        ref={props.setIframeEl}
        className={iframeCSS}
      ></iframe>
      {iframeDocument && createPortal(props.children, iframeDocument.body)}
    </div>
  );
}

function useInjectIframeCss(iframeDocument: Document | undefined) {
  const [componentTree, getComponentMetadata, activePage, fileMetadatas] =
    useStudioStore((store) => [
      store.actions.getComponentTree(),
      store.fileMetadatas.getComponentMetadata,
      store.pages.activePageName,
      store.fileMetadatas.UUIDToFileMetadata,
    ]);

  useEffect(() => {
    if (!iframeDocument) {
      return;
    }
    componentTree?.forEach((component) => {
      const metadataUUID = component.metadataUUID;
      if (!metadataUUID) {
        return;
      }
      const cssImports = getComponentMetadata(metadataUUID).cssImports;
      cssImports?.forEach((cssFilepath) => {
        void dynamicImportFromBrowser(cssFilepath + "?inline").then(
          (importedCss) => addStyleToIframe(importedCss.default, iframeDocument)
        );
      });
    });
    return () => {
      clearStylingFromIframe(iframeDocument);
    };
  }, [
    componentTree,
    getComponentMetadata,
    iframeDocument,
    activePage,
    fileMetadatas,
  ]);

  function addStyleToIframe(stying: string, iframeDocument: Document) {
    const styleEl = document.createElement("style");
    styleEl.innerText = stying;
    iframeDocument.head.appendChild(styleEl);
  }

  function clearStylingFromIframe(iframeDocument: Document) {
    const styleElements = Array.from(
      iframeDocument.head.getElementsByTagName("style")
    );
    for (const el of styleElements) {
      el.remove();
    }
  }
}

const useViewportOption = (
  viewport: Viewport,
  previewRef: RefObject<HTMLDivElement>
) => {
  const [css, setCss] = useState(
    (viewport.styles?.width ?? 0) * (previewRef.current?.clientHeight ?? 0) >
      (viewport.styles?.height ?? 0) * (previewRef.current?.clientWidth ?? 0)
      ? " w-full "
      : " h-full "
  );
  const handleResize = () => {
    const tempCss =
      (viewport.styles?.width ?? 0) * (previewRef.current?.clientHeight ?? 0) >
      (viewport.styles?.height ?? 0) * (previewRef.current?.clientWidth ?? 0)
        ? " w-full "
        : " h-full ";
    if (tempCss !== css) {
      setCss(tempCss);
    }
  };

  useEffect(() => {
    const resizeObserver = new ResizeObserver(handleResize);
    if (previewRef.current) {
      resizeObserver.observe(previewRef.current);
    }
    return () => resizeObserver.disconnect();
  });
  return css;
};
