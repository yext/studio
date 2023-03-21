import classNames from "classnames";
import { PropsWithChildren, useMemo } from "react";
import { Tooltip } from "react-tooltip";

import { v4 } from "uuid";

export default function ActionIconWrapper(
  props: PropsWithChildren<{
    tooltip: string;
    disabled?: boolean;
  }>
) {
  const anchorId = useMemo(() => v4(), []);
  const className = classNames("rounded p-1", {
    "text-gray-400": props.disabled,
    "text-violet-600 hover:bg-slate-200": !props.disabled,
  });
  return (
    <div className={className} id={anchorId}>
      {props.children}
      <Tooltip anchorId={anchorId} content={props.tooltip} />
    </div>
  );
}
