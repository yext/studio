import { CSSProperties, useMemo } from "react";
import { Tooltip } from "react-tooltip";
import { v4 } from "uuid";
import { ReactComponent as Info } from "../../icons/info.svg";

export interface TooltipIconProps {
  content: string;
  styles?: CSSProperties;
}

export default function TooltipIcon({ content, styles }: TooltipIconProps) {
  const tooltipId = useMemo(() => v4(), []);
  const defaultStyles = useMemo(() => {
    return { backgroundColor: "black", zIndex: 1 };
  }, []);

  return (
    <div>
      <Info id={tooltipId} className="ml-3 pb-1" data-testid="prop-tooltip" />
      <Tooltip
        style={styles || defaultStyles}
        anchorId={tooltipId}
        content={content}
        place="left"
        isOpen={true}
      />
    </div>
  );
}
