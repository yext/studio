import useImportedComponents from "../hooks/useImportedComponents";
import useStudioStore from "../store/useStudioStore";
import PreviewPanel from "./PreviewPanel";
import Highlighter from "./Highlighter";
import IFramePortal from "./IFramePortal";
import { CSSProperties } from "react";
import { useState } from "react";
import { Tooltip } from "react-tooltip";

const inlineStyles: CSSProperties = {
  overflow: "scroll",
};

export default function PreviewWithUseComponents() {
  const componentTree = useStudioStore((store) =>
    store.actions.getComponentTree()
  );
  const [tooltipProps, setTooltipProps] = useState({
    open: false,
    position: { x: 0, y: 0 },
    error: "",
    anchorId: "",
  });
  void useImportedComponents(componentTree);

  return (
    <>
      <Tooltip
        offset={-30}
        content={tooltipProps.error}
        anchorSelect={tooltipProps.anchorId}
        className="text-sm z-30"
        isOpen={tooltipProps.open}
        position={tooltipProps.position}
      />
      <IFramePortal
        className="h-full w-full"
        title="PreviewPanel"
        inlineStyles={inlineStyles}
      >
        <div>
          <PreviewPanel setTooltipProps={setTooltipProps} />
          <div className="absolute top-0">
            <Highlighter />
          </div>
        </div>
      </IFramePortal>
    </>
  );
}
