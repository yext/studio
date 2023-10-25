import { createPortal } from "react-dom";
import { Dispatch, PropsWithChildren, SetStateAction, useEffect } from "react";
import useStudioStore from "../store/useStudioStore";
import { twMerge } from "tailwind-merge";

export default function IFramePortal(
  props: PropsWithChildren<{
    title: string;
    iframeEl: HTMLIFrameElement | null;
    setIframeEl: Dispatch<SetStateAction<HTMLIFrameElement | null>>;
  }>
) {
  const iframeDocument = props.iframeEl?.contentWindow?.document;
  useParentDocumentStyles(iframeDocument);
  const viewportCss = useStudioStore((store) => store.pagePreview.viewport.css);
  const iframeCSS = twMerge("mr-auto ml-auto", viewportCss);

  return (
    <div className="grow w-1/3 bg-white border-y-8 overflow-x-scroll">
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
