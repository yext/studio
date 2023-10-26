import { createPortal } from "react-dom";
import { Dispatch, PropsWithChildren, SetStateAction } from "react";
import useStudioStore from "../store/useStudioStore";
import { twMerge } from "tailwind-merge";
import useInjectActiveStyles from "../hooks/useInjectActiveStyles";

export default function IFramePortal(
  props: PropsWithChildren<{
    title: string;
    iframeEl: HTMLIFrameElement | null;
    setIframeEl: Dispatch<SetStateAction<HTMLIFrameElement | null>>;
  }>
) {
  const iframeDocument = props.iframeEl?.contentWindow?.document;
  useInjectActiveStyles(iframeDocument);
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
