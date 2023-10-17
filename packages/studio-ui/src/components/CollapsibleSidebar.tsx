import classNames from "classnames";
import { PropsWithChildren, useCallback, useState } from "react";
import { ReactComponent as Arrow } from "../icons/chevron-left.svg";

interface CollapsibleSidebarProps {
  side: "right" | "left";
}
export default function CollapsibleSidebar({
  side,
  children,
}: PropsWithChildren<CollapsibleSidebarProps>): JSX.Element {
  const [isOpen, setIsOpen] = useState(true);
  const toggleIsOpen = useCallback(() => setIsOpen((isOpen) => !isOpen), []);
  const arrowRight =
    (side === "right" && isOpen) || (side === "left" && !isOpen);
  const containerStyle = classNames("flex", {
    "w-1/4": isOpen,
  });

  const childrenStyle = classNames("flex flex-col grow", {
    hidden: !isOpen,
  });

  const arrowStyle = classNames("h-3 m-0.5", {
    "rotate-180": arrowRight,
  });

  const arrowMarginStyle = classNames("flex bg-gray-200 border-2", {
    "hover:border-r-blue-700": arrowRight,
    "hover:border-l-blue-700": !arrowRight,
  });

  const renderCollapseButton = useCallback(() => {
    return (
      <div className={arrowMarginStyle}>
        <button
          onClick={toggleIsOpen}
          aria-label={`Collapse/Expand ${side} sidebar`}
        >
          <Arrow className={arrowStyle} />
        </button>
      </div>
    );
  }, [arrowMarginStyle, arrowStyle, side, toggleIsOpen]);

  return (
    <div className={containerStyle}>
      {side === "right" && renderCollapseButton()}
      <div className={childrenStyle}>{children}</div>
      {side === "left" && renderCollapseButton()}
    </div>
  );
}
