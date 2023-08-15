import { Dispatch, SetStateAction, useCallback, useRef, useState } from "react";
import useRootClose from "@restart/ui/useRootClose";
import ViewportMenu from "./ViewportMenu";
import { ViewportStyles } from "./defaults";

export default function ViewportButton(props: {
  setViewportDimensions: Dispatch<SetStateAction<ViewportStyles>>;
}): JSX.Element {
  const { setViewportDimensions } = props;
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const icon =
    "https://assets.brandfolder.com/q4zcv4-5x9x3c-cwpfeb/v/9458449/original/DevicesLaptopPhoneTablet_B.png";
  const handleClose = useCallback(() => setIsOpen(false), []);
  useRootClose(containerRef, () => {
    handleClose();
  });
  const handleClick = useCallback(() => setIsOpen(!isOpen), [isOpen]);

  return (
    <div ref={containerRef}>
      <button onClick={handleClick}>
        <img
          className="h-14 w-auto rounded-md lg:block pr-1"
          src={icon}
          alt="Viewport icon"
        />
      </button>
      {isOpen && (
        <ViewportMenu
          setViewportDimensions={setViewportDimensions}
          closeMenu={handleClose}
        />
      )}
    </div>
  );
}
