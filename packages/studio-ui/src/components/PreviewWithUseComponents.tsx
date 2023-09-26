import PreviewPanel from "./PreviewPanel";
import Highlighter from "./Highlighter";
import IFramePortal from "./IFramePortal";
import { Tooltip, ITooltip } from "react-tooltip";
import { useState } from "react";

export default function PreviewWithUseComponents() {
  const [tooltipProps, setTooltipProps] = useState<ITooltip>({
    isOpen: false,
    position: { x: 0, y: 0 },
    content: "",
    anchorSelect: "",
  });
  const [iframeEl, setIframeEl] = useState<HTMLIFrameElement | null>(null);

  return (
    <>
      <Tooltip offset={-30} className="text-sm z-20" {...tooltipProps} />
      <IFramePortal
        title="PreviewPanel"
        iframeEl={iframeEl}
        setIframeEl={setIframeEl}
      >
        <PreviewPanel setTooltipProps={setTooltipProps} />
        <div className="absolute top-0">
          <Highlighter iframeEl={iframeEl} />
        </div>
      </IFramePortal>
    </>
  );
}
