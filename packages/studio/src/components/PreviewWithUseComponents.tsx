import useImportedComponents from "../hooks/useImportedComponents";
import useStudioStore from "../store/useStudioStore";
import PreviewPanel from "./PreviewPanel";
import Highlighter from "./Highlighter";
import IFramePortal from "./IFramePortal";
import { CSSProperties } from "react";

const inlineStyles: CSSProperties = {
  transform: "translateY(-50px)",
};

const innerIframeStyles: CSSProperties = {
  transform: "translateY(50px)",
};

export default function PreviewWithUseComponents() {
  const componentTree = useStudioStore((store) =>
    store.actions.getComponentTree()
  );
  void useImportedComponents(componentTree);

  return (
    <IFramePortal
      className="h-full w-full"
      title="PreviewPanel"
      inlineStyles={inlineStyles}
    >
      <div style={innerIframeStyles}>
        <PreviewPanel />
        <div className="absolute top-[-50px]">
          <Highlighter />
        </div>
      </div>
    </IFramePortal>
  );
}
