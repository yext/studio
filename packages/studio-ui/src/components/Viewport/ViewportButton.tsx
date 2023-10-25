import { useCallback, useRef, useState } from "react";
import useRootClose from "@restart/ui/useRootClose";
import ViewportMenu from "./ViewportMenu";
import { ReactComponent as Icon } from "../../icons/viewport.svg";

export default function ViewportButton(): JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const handleClose = useCallback(() => setIsOpen(false), []);
  useRootClose(containerRef, handleClose);
  const handleClick = useCallback(() => setIsOpen((isOpen) => !isOpen), []);

  return (
    <div ref={containerRef}>
      <button onClick={handleClick} aria-label="See Available Viewports">
        <Icon />
      </button>
      {isOpen && <ViewportMenu closeMenu={handleClose} />}
    </div>
  );
}
