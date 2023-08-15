import useImportedComponents from "../hooks/useImportedComponents";
import useStudioStore from "../store/useStudioStore";
import PreviewPanel from "./PreviewPanel";
import Highlighter from "./Highlighter";
import IFramePortal from "./IFramePortal";
import { Tooltip, ITooltip } from "react-tooltip";
import { RefObject, useState } from "react";
import { ViewportStyles, EXPANDED_VIEWPORTS } from "./Viewport/defaults";
import { twMerge } from "tailwind-merge";

export default function PreviewWithUseComponents(props: {
  viewportDimensions: ViewportStyles;
  previewRef: RefObject<HTMLDivElement>;
}) {
  const { viewportDimensions, previewRef } = props;
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
