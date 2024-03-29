import { CSSProperties, useEffect, useMemo } from "react";
import useActiveComponentName from "../hooks/useActiveComponentName";
import useStudioStore from "../store/useStudioStore";
import { ComponentStateKind } from "@yext/studio-plugin";

/**
 * Highlights the current activeComponentRect on the page.
 */
export default function Highlighter(props: {
  iframeEl: HTMLIFrameElement | null;
}) {
  const { iframeEl } = props;
  const rect = useStudioStore((store) => store.pages.activeComponentRect);
  const activeUUID = useStudioStore((store) => store.pages.activeComponentUUID);
  const setRect = useStudioStore((store) => store.pages.setActiveComponentRect);
  const componentName = useActiveComponentName();
  const isErrorState = useStudioStore(
    (store) =>
      store.actions.getActiveComponentState()?.kind === ComponentStateKind.Error
  );
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

  useEffect(() => {
    if (!activeUUID) {
      setRect(undefined);
    }
  }, [activeUUID, setRect]);

  if (!rect) {
    return null;
  }

  return (
    <div style={style}>
      <div style={tagStyle}>{componentName}</div>
    </div>
  );
}
