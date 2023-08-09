import useImportedComponents from "../hooks/useImportedComponents";
import useStudioStore from "../store/useStudioStore";
import PreviewPanel from "./PreviewPanel";
import Highlighters from "./Highlighters";
import IFramePortal from "./IFramePortal";
import { CSSProperties, useState } from "react";

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
  const [iframeEl, setIframeEl] = useState<HTMLIFrameElement | null>(null);
  void useImportedComponents(componentTree);

  return (
    <IFramePortal
      className="h-full w-full"
      title="PreviewPanel"
      inlineStyles={inlineStyles}
      iframeEl={iframeEl}
      setIframeEl={setIframeEl}
    >
      <div style={innerIframeStyles}>
        <PreviewPanel />
        <div className="absolute top-[-50px]">
          <Highlighter iframeEl={iframeEl} />
        </div>
      </div>
    </IFramePortal>
  );
}
