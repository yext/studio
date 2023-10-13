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
  const [open, setOpen] = useState(true);
  const toggleOpen = useCallback(() => {
    setOpen(!open);
  }, [open]);

  const justifyButtonStyle = classNames("flex", {
    "justify-start": side === "right",
    "justify-end": side === "left",
  });

  const sidebarStyle = classNames("flex flex-col grow", {
    hidden: !open,
  });

  return (
    <div
      className={classNames("flex flex-col", {
        "w-1/4": open,
      })}
    >
      <div className={justifyButtonStyle}>
        <button onClick={toggleOpen} aria-label={`Collapse ${side} sidebar`}>
          <Hamburger className="h-5 m-2" />
        </button>
      </div>
      <div className={sidebarStyle}>{children}</div>
    </div>
  );
}
