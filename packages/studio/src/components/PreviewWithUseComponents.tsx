import useImportedComponents from "../hooks/useImportedComponents";
import useStudioStore from "../store/useStudioStore";
import PreviewPanel from "./PreviewPanel";
import Highlighter from "./Highlighter";
import IFramePortal from "./IFramePortal";
import { CSSProperties } from "react";

const inlineStyles: CSSProperties = {
  overflow: "scroll",
};

export default function PreviewWithUseComponents(props) {
  const { setTooltipProps } = props;
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
      <div>
        <PreviewPanel setTooltipProps={setTooltipProps} />
        <div className="absolute top-0">
          <Highlighter />
        </div>
      </div>
    </IFramePortal>
  );
}
