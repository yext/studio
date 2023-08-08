import { createPortal } from "react-dom";
import {
  CSSProperties,
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useEffect,
} from "react";

export default function IFramePortal(
  props: PropsWithChildren<{
    className?: string;
    title: string;
    inlineStyles: CSSProperties;
    iframeEl: HTMLIFrameElement | null;
    setIframeEl: Dispatch<SetStateAction<HTMLIFrameElement | null>>;
  }>
) {
  const iframeDocument = props.iframeEl?.contentWindow?.document;
  useParentDocumentStyles(iframeDocument);

  return (
    <>
      <iframe
        title={props.title}
        ref={props.setIframeEl}
        className={props.className}
        style={props.inlineStyles}
      ></iframe>
      {iframeDocument && createPortal(props.children, iframeDocument.body)}
    </>
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
