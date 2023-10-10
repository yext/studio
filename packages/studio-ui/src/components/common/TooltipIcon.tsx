import { useMemo } from "react";
import { Tooltip } from "react-tooltip";
import { v4 } from "uuid";
import { ReactComponent as Info } from "../../icons/info.svg";

export interface TooltipIconProps {
  content: string;
}

export default function TooltipIcon({ content }: TooltipIconProps) {
  const tooltipId = useMemo(() => v4(), []);

  return (
    <div>
      <Info id={tooltipId} className="ml-3 pb-1" data-testid="prop-tooltip" />
      <Tooltip
        className="bg-black z-20"
        anchorId={tooltipId}
        content={content}
        place="left"
      />
    </div>
  );
}
