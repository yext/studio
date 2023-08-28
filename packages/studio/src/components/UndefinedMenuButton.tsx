import { PropsWithChildren, useCallback, useRef, useState } from "react";
import useRootClose from "@restart/ui/useRootClose";
import { ReactComponent as EllipsesIcon } from "../icons/ellipses.svg";
import { PropType, PropVal } from "@yext/studio-plugin";
import PropValueHelpers from "../utils/PropValueHelpers";

interface UndefinedMenuButtonProps {
  propType: PropType;
  isUndefined: boolean;
  updateProp: (propVal: PropVal | undefined) => void;
}

export default function UndefinedMenuButton({
  propType,
  isUndefined,
  updateProp,
  children,
}: PropsWithChildren<UndefinedMenuButtonProps>) {
  const [isOpen, setIsOpen] = useState(false);
  const menuItemRef = useRef<HTMLDivElement>(null);

  useRootClose(menuItemRef, () => setIsOpen(false), { disabled: !isOpen });

  const onButtonClick = useCallback(() => {
    setIsOpen((isOpen) => !isOpen);
  }, []);

  const onMenuClick = useCallback(() => {
    isUndefined
      ? updateProp(PropValueHelpers.getDefaultPropVal(propType))
      : updateProp(undefined);
    setIsOpen(false);
  }, [isUndefined, updateProp, propType]);
  const undefinedMenuText = isUndefined
    ? "Reset to Default"
    : "Set as Undefined";

  return (
    <div className="flex relative grow">
      {children}
      <EllipsesIcon
        role="button"
        onClick={onButtonClick}
        aria-label="Toggle undefined value menu"
        className="absolute right-0 top-1"
      />
      {isOpen && (
        <div className="relative mt-5">
          <div
            className="absolute bg-white rounded border z-10 shadow-2xl text-sm right-0 cursor-pointer hover:bg-gray-100 px-2 py-1 whitespace-nowrap"
            onClick={onMenuClick}
            ref={menuItemRef}
          >
            {undefinedMenuText}
          </div>
        </div>
      )}
    </div>
  );
}
