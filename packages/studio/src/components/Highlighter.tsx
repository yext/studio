import { CSSProperties, useEffect, useMemo } from "react";
import useActiveComponentName from "../hooks/useActiveComponentName";
import useStudioStore from "../store/useStudioStore";

/**
 * Highlights the current activeComponentRect on the page.
 */
export default function Highlighter() {
  const rect = useStudioStore((store) => store.pages.activeComponentRect);
  const activeUUID = useStudioStore((store) => store.pages.activeComponentUUID);
  const setRect = useStudioStore((store) => store.pages.setActiveComponentRect);
  const componentName = useActiveComponentName();

  const style: CSSProperties = useMemo(() => {
    if (!rect) {
      return {};
    }
    return {
      position: "absolute",
      zIndex: "999",
      left: `${window.scrollX + rect.left}px`,
      top: `${window.scrollY + rect.top}px`,
      width: `${rect.width}px`,
      height: `${rect.height}px`,
      boxSizing: "border-box",
      border: "1px solid #5892FF",
      pointerEvents: "none",
    };
  }, [rect]);

  const tagStyle: CSSProperties = useMemo(() => {
    if (!rect) {
      return {};
    }
    return {
      position: "absolute",
      top: `${rect.height - 1}px`,
      backgroundColor: "#5892FF",
      color: "white",
      padding: "0px 10px",
    };
  }, [rect]);

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
