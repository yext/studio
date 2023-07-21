import { ErrorComponentState } from "@yext/studio-plugin";
import { useCallback, useMemo, useRef, useState } from "react";
import { v4 } from "uuid";
import ErrorBoundary from "./common/ErrorBoundary";
import { Tooltip } from "react-tooltip";

export default function ErrorComponentPreview(props: {
  errorComponentState: ErrorComponentState;
  element: JSX.Element | null;
}) {
  const { errorComponentState, element } = props;
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
    x: (rect.right + rect.left) / 2,
    y: rect.top - 40,
  };

  return (
    <div
      ref={containerRef}
      id={anchorId}
      className="hover:shadow-sm border hover:border-red-300 border-transparent"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <ErrorBoundary customError={errorComponentState.message}>
        {element}
      </ErrorBoundary>
      <Tooltip
        offset={-30}
        content={errorComponentState.message}
        anchorSelect={`#${anchorId}`}
        className="text-sm"
        isOpen={tooltipOpen}
        position={tooltipPosition}
      />
    </div>
  );
}
