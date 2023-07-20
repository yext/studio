import { createPortal } from "react-dom";
import { CSSProperties, PropsWithChildren, useEffect, useState } from "react";

export default function IFramePortal(
  props: PropsWithChildren<{
    className?: string;
    title: string;
    inlineStyles: CSSProperties;
  }>
) {
  const [iframeEl, setIframeEl] = useState<HTMLIFrameElement | null>(null);
  const iframeDocument = iframeEl?.contentWindow?.document;
  useParentDocumentStyles(iframeDocument);

  return (
    <>
      <iframe
        title={props.title}
        ref={setIframeEl}
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
