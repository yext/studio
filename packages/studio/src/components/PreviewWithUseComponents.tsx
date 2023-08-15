import useImportedComponents from "../hooks/useImportedComponents";
import useStudioStore from "../store/useStudioStore";
import PreviewPanel from "./PreviewPanel";
import Highlighter from "./Highlighter";
import IFramePortal from "./IFramePortal";
import { Tooltip, ITooltip } from "react-tooltip";
import { useState } from "react";
import { ViewportStyles } from "./Viewport/defaults";

export default function PreviewWithUseComponents(props: ViewportStyles) {
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

  return (
    <>
      <Tooltip offset={-30} className="text-sm z-20" {...tooltipProps} />
      <IFramePortal
        className={
          "mr-auto ml-auto border-2 border-black" + props.height + props.width
        }
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
