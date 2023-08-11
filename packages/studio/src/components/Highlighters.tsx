import { CSSProperties, useMemo } from "react";
import { useComponentNames } from "../hooks/useActiveComponentName";
import useStudioStore from "../store/useStudioStore";
import { ComponentStateKind } from "@yext/studio-plugin";
import DOMRectProperties from "../store/models/DOMRectProperties";

/**
 * Generates Highlighters for all selected components.
 */
export default function Highlighters(props: {
  iframeEl: HTMLIFrameElement | null;
}): JSX.Element {
  const { iframeEl } = props;
  const [selectedComponentUUIDs, selectedComponentRectsMap] = useStudioStore(
    (store) => {
      return [
        store.pages.selectedComponentUUIDs,
        store.pages.selectedComponentRectsMap,
      ];
    }
  );

  return (
    <div>
      {Array.from(selectedComponentUUIDs).map((uuid) => {
        return (
          <Highlighter
            key={`${uuid}-key`}
            uuid={uuid}
            rect={selectedComponentRectsMap[uuid]}
            iframeEl={iframeEl}
          />
        );
      })}
    </div>
  );
}

/**
 * Highlights the component in the page preview.
 */
function Highlighter({
  uuid,
  rect,
  iframeEl,
}: {
  uuid: string;
  rect: DOMRectProperties | undefined;
  iframeEl: HTMLIFrameElement | null;
}) {
  const componentTree = useStudioStore((store) =>
    store.actions.getComponentTree()
  );
  const isErrorState = useStudioStore(
    (store) =>
      store.actions.getComponentState(componentTree, uuid)?.kind ===
      ComponentStateKind.Error
  );
  const [componentName] = useComponentNames(new Set([uuid]));

  const red300 = "rgb(252 165 165)";
  const skyBlueFromMocks = "rgb(88,146,255)";
  const color = isErrorState ? red300 : skyBlueFromMocks;

  const style: CSSProperties = useMemo(() => {
    if (!rect) {
      return {};
    }
    return {
      position: "absolute",
      zIndex: "10",
      left: `${(iframeEl?.contentWindow?.scrollX ?? 0) + rect.left}px`,
      top: `${(iframeEl?.contentWindow?.scrollY ?? 0) + rect.top}px`,
      width: `${rect.width}px`,
      height: `${rect.height}px`,
      boxSizing: "border-box",
      border: `1px solid ${color}`,
      pointerEvents: "none",
    };
  }, [rect, color, iframeEl]);

  const tagStyle: CSSProperties = useMemo(() => {
    if (!rect) {
      return {};
    }
    return {
      position: "absolute",
      top: `${rect.height - 1}px`,
      backgroundColor: color,
      color: "white",
      padding: "0px 10px",
    };
  }, [rect, color]);

  if (!rect) {
    return null;
  }

  return (
    <div style={style}>
      <div style={tagStyle}>{componentName.name}</div>
    </div>
  );
}
