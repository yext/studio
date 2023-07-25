import { PropsWithChildren } from "react";
import { ReactComponent as X } from "../icons/x.svg";

export interface RemovableElementProps {
  onRemove: () => void;
  buttonClasses?: string;
  ariaLabel?: string;
}

export default function RemovableElement(
  props: PropsWithChildren<RemovableElementProps>
) {
  const { children, onRemove, buttonClasses, ariaLabel } = props;

  return (
    <div className="flex w-full">
      {children}
      <button
        onClick={onRemove}
        className={buttonClasses}
        aria-label={ariaLabel ? ariaLabel : "Remove Element"}
      >
        <X />
      </button>
    </div>
  );
}
