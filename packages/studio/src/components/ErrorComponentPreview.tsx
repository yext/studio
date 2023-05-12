import { ErrorComponentState } from "@yext/studio-plugin";
import { useMemo } from "react";
import { v4 } from "uuid";
import ErrorBoundary from "./common/ErrorBoundary";
import { Tooltip } from "react-tooltip";

export default function ErrorComponentPreview(props: {
  errorComponentState: ErrorComponentState;
  element: JSX.Element | null;
}) {
  const { errorComponentState, element } = props;
  const uniqueId = useMemo(() => v4(), []);
  // We cannot use the uuid on ErrorComponentState due to
  // repeaters re-using the same uuid
  const anchorId = `ErrorComponentState-${uniqueId}`;

  return (
    <div
      id={anchorId}
      className="hover:shadow-sm border hover:border-red-300 border-transparent"
    >
      <ErrorBoundary customError={errorComponentState.message}>
        {element}
      </ErrorBoundary>
      <Tooltip
        content={errorComponentState.message}
        anchorId={anchorId}
        className="text-xs z-20"
      />
    </div>
  );
}
