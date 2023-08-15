import useImportedComponents from "../hooks/useImportedComponents";
import useStudioStore from "../store/useStudioStore";
import PreviewPanel from "./PreviewPanel";
import Highlighter from "./Highlighter";
import IFramePortal from "./IFramePortal";
import { Tooltip, ITooltip } from "react-tooltip";
import { useState } from "react";
import { ViewportStyles, MINIMAL_VIEWPORTS_CSS } from "./Viewport/defaults";
import { twMerge } from "tailwind-merge";

export default function PreviewWithUseComponents(props: {
  viewportDimensions: ViewportStyles;
}) {
  const { viewportDimensions } = props;
  const componentTree = useStudioStore((store) =>
    store.actions.getComponentTree()
  );
  const [tooltipProps, setTooltipProps] = useState<ITooltip>({
    isOpen: false,
    position: { x: 0, y: 0 },
    content: "",
    anchorSelect: "",
  });
  const [iframeEl, setIframeEl] = useState<HTMLIFrameElement | null>(null);
  void useImportedComponents(componentTree);

  const dimensions =
    MINIMAL_VIEWPORTS_CSS[viewportDimensions.name.replace(/\s+/g, "")] +
    (viewportDimensions.width / viewportDimensions.height >
    window.innerWidth / window.innerHeight
      ? " w-full "
      : " h-full ");

  const iframeCSS = twMerge("mr-auto ml-auto border-2", dimensions);

  return (
    <>
      <Tooltip offset={-30} className="text-sm z-20" {...tooltipProps} />
      <IFramePortal
        className={iframeCSS}
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
