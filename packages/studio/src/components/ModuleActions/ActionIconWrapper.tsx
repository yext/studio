import { PropsWithChildren, useMemo } from "react";
import { Tooltip } from "react-tooltip";

import { v4 } from "uuid";

export default function ActionIconWrapper(
  props: PropsWithChildren<{
    tooltip: string;
  }>
) {
  const anchorId = useMemo(() => v4(), []);
  return (
    <div className="hover:bg-slate-200 rounded p-1" id={anchorId}>
      {props.children}
      <Tooltip anchorId={anchorId} content={props.tooltip} />
    </div>
  );
}
