import { useCallback, useMemo, useRef, useState } from "react";
import { v4 } from "uuid";
import ErrorBoundary from "./common/ErrorBoundary";
import { ErrorComponentState } from "@yext/studio-plugin";

export default function ErrorComponentPreview(props: {
  errorComponentState: ErrorComponentState;
  element: JSX.Element | null;
  setTooltipProps;
}) {
  const { errorComponentState, element, setTooltipProps } = props;
  const containerRef = useRef<HTMLDivElement>(null);
  const uniqueId = useMemo(() => v4(), []);
  // We cannot use the uuid on ErrorComponentState due to
  // repeaters re-using the same uuid
  const anchorId = `ErrorComponentState-${uniqueId}`;
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const onMouseEnter = useCallback(() => {
    setTooltipOpen(true);
  }, []);
  const onMouseLeave = useCallback(() => {
    setTooltipOpen(false);
  }, []);

  const rect = containerRef.current?.getBoundingClientRect();
  const tooltipPosition = rect && {
    x: (rect.right + rect.left) / 2 + window.innerWidth / 4 - window.scrollX,
    y: rect.top + 25 - window.scrollY,
  };

  document
    .querySelector("iframe")
    ?.contentDocument?.addEventListener("scroll", () => setTooltipOpen(false));

  setTooltipProps({
    open: tooltipOpen,
    error: errorComponentState.message,
    anchorId: anchorId,
    position: tooltipPosition,
  });

  return (
    <div
      ref={containerRef}
      id={anchorId}
      className="hover:shadow-sm border hover:border-red-300 border-transparent relative z-20"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <ErrorBoundary customError={errorComponentState.message}>
        {element}
      </ErrorBoundary>
    </div>
  );
}
