import { createPortal } from "react-dom";
import { PropsWithChildren, useState } from "react";

export default function IFramePortal(
  props: PropsWithChildren<{
    className?: string;
  }>
) {
  const [iframeRef, setIframeRef] = useState<HTMLIFrameElement | null>(null);
  const body = iframeRef?.contentWindow?.document.body;

  return (
    <>
      <iframe
        title="PreviewPanel"
        ref={setIframeRef}
        className={props.className}
      ></iframe>
      {body && createPortal(props.children, body)}
    </>
  );
}
