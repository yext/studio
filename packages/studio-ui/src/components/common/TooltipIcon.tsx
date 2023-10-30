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
      <Info
        id={tooltipId}
        className="ml-1 pb-1 mr-4"
        data-testid="prop-tooltip"
      />
      <Tooltip
        className="bg-black z-20 max-w-[23.5%]"
        anchorId={tooltipId}
        content={content}
        place="top"
        closeOnScroll={true}
        positionStrategy="fixed"
      />
    </div>
  );
}
