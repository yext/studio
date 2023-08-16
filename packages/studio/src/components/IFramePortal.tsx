import { createPortal } from "react-dom";
import {
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useEffect,
  useRef,
} from "react";
import useStudioStore from "../store/useStudioStore";
import { EXPANDED_VIEWPORTS } from "./Viewport/defaults";
import { twMerge } from "tailwind-merge";

export default function IFramePortal(
  props: PropsWithChildren<{
    title: string;
    iframeEl: HTMLIFrameElement | null;
    setIframeEl: Dispatch<SetStateAction<HTMLIFrameElement | null>>;
  }>
) {
  const previewRef = useRef<HTMLDivElement>(null);
  const iframeDocument = props.iframeEl?.contentWindow?.document;
  const [viewportDimensions] = useStudioStore((store) => [
    store.pagePreview.viewportDimensions,
  ]);
  const dimensions =
    viewportDimensions.width * (previewRef.current?.clientHeight ?? 0) >
    viewportDimensions.height * (previewRef.current?.clientWidth ?? 0)
      ? " w-full "
      : " h-full ";
  const id = viewportDimensions.name.replace(/\s+/g, "").toLowerCase();
  const iframeCSS = twMerge(
    "mr-auto ml-auto border-2",
    EXPANDED_VIEWPORTS[id].css,
    dimensions
  );
  useParentDocumentStyles(iframeDocument);

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
