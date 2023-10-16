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
  useParentDocumentStyles(iframeDocument);
  const iframeCSS = twMerge(
    "mr-auto ml-auto",
    viewport.css,
    useCSS(viewport, previewRef)
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

function useParentDocumentStyles(iframeDocument: Document | undefined) {
  useEffect(() => {
    if (iframeDocument) {
      const inlineStyles = document.head.getElementsByTagName("style");
      const stylesheets = document.head.querySelectorAll(
        'link[rel="stylesheet"]'
      );
      for (const el of [...inlineStyles, ...stylesheets]) {
        iframeDocument.head.appendChild(el.cloneNode(true));
      }
    }
  }, [iframeDocument]);
}

const useCSS = (viewport: Viewport, previewRef: RefObject<HTMLDivElement>) => {
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
