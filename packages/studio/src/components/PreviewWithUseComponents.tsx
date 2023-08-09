import useImportedComponents from "../hooks/useImportedComponents";
import useStudioStore from "../store/useStudioStore";
import PreviewPanel from "./PreviewPanel";
import Highlighter from "./Highlighter";
import IFramePortal from "./IFramePortal";
import { Tooltip, IPosition } from "react-tooltip";
import { useState } from "react";

export interface tooltipProps {
  open: boolean;
  position: IPosition;
  error: string;
  anchorId: string;
}

export default function PreviewWithUseComponents() {
  const componentTree = useStudioStore((store) =>
    store.actions.getComponentTree()
  );
  const [tooltipProps, setTooltipProps] = useState<tooltipProps>({
    open: false,
    position: { x: 0, y: 0 },
    error: "",
    anchorId: "",
  });
  const [iframeEl, setIframeEl] = useState<HTMLIFrameElement | null>(null);
  void useImportedComponents(componentTree);

  return (
    <>
      <Tooltip
        offset={-30}
        content={tooltipProps.error}
        anchorSelect={tooltipProps.anchorId}
        className="text-sm z-20"
        isOpen={tooltipProps.open}
        position={tooltipProps.position}
      />
      <IFramePortal
        className="h-full w-full"
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
