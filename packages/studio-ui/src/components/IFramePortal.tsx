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

export default function IFramePortal(
  props: PropsWithChildren<{
    title: string;
    iframeEl: HTMLIFrameElement | null;
    setIframeEl: Dispatch<SetStateAction<HTMLIFrameElement | null>>;
  }>
) {
  const previewRef = useRef<HTMLDivElement>(null);
  const iframeDocument = props.iframeEl?.contentWindow?.document;
  const [viewport] = useStudioStore((store) => [store.pagePreview.viewport]);
  useInjectUserStyles(iframeDocument);
  const iframeCSS = twMerge(
    "mr-auto ml-auto",
    viewport.css,
    useViewportOption(viewport, previewRef)
  );

  return (
    <div ref={previewRef} className="grow w-1/3 bg-white border-y-8">
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

function useInjectUserStyles(iframeDocument: Document | undefined) {
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
  }, [componentTree, getComponentMetadata, iframeDocument, pageCss, activePage, UUIDToFileMetadata]);
}

function clearStylingFromIframe(iframeDocument: Document) {
  const styleElements = Array.from(
    iframeDocument.head.getElementsByTagName("style")
  );
  for (const el of styleElements) {
    el.remove();
  }
}

function injectStyleIntoIframe(iframeDocument: Document | undefined, filepath: string) {
  const originalStyletag = document.querySelector(`[studio-style-filepath='${filepath}']`)
  if (originalStyletag && iframeDocument) {
    const iframeStyletag = originalStyletag.cloneNode(true)
    iframeDocument.head.appendChild(iframeStyletag)
  }
}

const useViewportOption = (viewport: Viewport, previewRef: RefObject<HTMLDivElement>) => {
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
