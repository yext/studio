import {
  useCallback,
  useMemo,
  useRef,
  useState,
  useEffect,
  Dispatch,
  SetStateAction,
} from "react";
import { v4 } from "uuid";
import ErrorBoundary from "./common/ErrorBoundary";
import { ErrorComponentState } from "@yext/studio-plugin";
import { ITooltip } from "react-tooltip";

export default function ErrorComponentPreview(props: {
  errorComponentState: ErrorComponentState;
  element: JSX.Element | null;
  setTooltipProps: Dispatch<SetStateAction<ITooltip>>;
}) {
  const { errorComponentState, element, setTooltipProps } = props;
  const containerRef = useRef<HTMLDivElement>(null);
  const uniqueId = useMemo(() => v4(), []);
  // We cannot use the uuid on ErrorComponentState due to
  // repeaters re-using the same uuid
  const anchorId = `ErrorComponentState-${uniqueId}`;
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const closeTooltip = () => setTooltipOpen(false);
  const onMouseEnter = useCallback(() => {
    setTooltipOpen(true);
  }, []);
  const onMouseLeave = useCallback(closeTooltip, []);

  useEffect(() => {
    document
      .querySelector("iframe")
      ?.contentDocument?.addEventListener("scroll", closeTooltip);
    document.addEventListener("scroll", closeTooltip);
    return () => {
      document
        .querySelector("iframe")
        ?.contentDocument?.removeEventListener("scroll", closeTooltip);
      document.removeEventListener("scroll", closeTooltip);
    };
  }, []);

  useEffect(() => {
    const rect = containerRef.current?.getBoundingClientRect();
    const y = (rect && rect.top + 25 - window.scrollY) || 0;
    const tooltipPosition = rect && {
      x: (rect.right + rect.left) / 2 + window.innerWidth / 4 - window.scrollX,
      y: y < 25 ? 25 : y,
    };

    setTooltipProps({
      isOpen: tooltipOpen,
      content: errorComponentState.message,
      anchorSelect: anchorId,
      position: tooltipPosition || { x: 0, y: 0 },
    });
  }, [tooltipOpen, anchorId, errorComponentState, setTooltipProps]);

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
