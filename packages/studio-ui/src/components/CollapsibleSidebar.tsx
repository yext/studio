import classNames from "classnames";
import { PropsWithChildren, useCallback, useState } from "react";
import { ReactComponent as Hamburger } from "../icons/hamburger.svg";

interface CollapsibleSidebarProps {
  side: "right" | "left";
}
export default function CollapsibleSidebar({
  side,
  children,
}: PropsWithChildren<CollapsibleSidebarProps>): JSX.Element {
  const [isOpen, setIsOpen] = useState(true);
  const toggleIsOpen = useCallback(() => setIsOpen((isOpen) => !isOpen), []);

  const containerStyle = classNames("flex flex-col", {
    "w-1/4": isOpen,
  });

  const justifyButtonStyle = classNames("flex", {
    "justify-start": side === "right",
    "justify-end": side === "left",
  });

  const sidebarStyle = classNames("flex flex-col grow", {
    hidden: !isOpen,
  });

  return (
    <div className={containerStyle}>
      <div className={justifyButtonStyle}>
        <button onClick={toggleIsOpen} aria-label={
          isOpen 
          ? `Collapse ${side} sidebar`
          : `Expand ${side} sidebar`}
          >
          <Hamburger className="h-5 m-2" />
        </button>
      </div>
      <div className={sidebarStyle}>{children}</div>
    </div>
  );
}
