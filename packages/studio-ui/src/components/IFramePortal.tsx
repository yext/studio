import { createPortal } from "react-dom";
import { Dispatch, PropsWithChildren, SetStateAction, useRef } from "react";
import useStudioStore from "../store/useStudioStore";
import { twMerge } from "tailwind-merge";
import useInjectUserStyles from "../hooks/useInjectUserStyles";
import useViewportOption from "../hooks/useViewportOption";

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
