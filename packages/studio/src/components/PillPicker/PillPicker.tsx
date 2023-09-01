import { useCallback, useRef, useState } from "react";
import { ReactComponent as EmbedIcon } from "../../icons/embed.svg";
import { useRootClose } from "@restart/ui";
import classNames from "classnames";

interface PillPickerProps {
  availableItems: string[];
  selectItem: (item: string) => void;
  disabled?: boolean;
  getDisplayName?: (item: string) => string;
}

/**
 * An icon that displays a dropdown of available items when clicked.
 */
export default function PillPicker({
  availableItems,
  selectItem,
  disabled,
  getDisplayName,
}: PillPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  useRootClose(containerRef, () => {
    setIsOpen(false);
  });

  const toggleOpen = useCallback(() => {
    if (disabled) {
      return;
    }
    setIsOpen((isOpen) => !isOpen);
  }, [disabled]);

  const embedIconClasses = classNames("opacity-50", {
    "cursor-pointer hover:opacity-100": !disabled,
    "cursor-default": disabled,
  });

  return (
    <div className="ml-auto mb-1" ref={containerRef}>
      <EmbedIcon
        role="button"
        onClick={toggleOpen}
        className={embedIconClasses}
        aria-label="Toggle pill picker"
      />
      {isOpen && renderDropdown(availableItems, selectItem, getDisplayName)}
    </div>
  );
}

function renderDropdown(
  items: string[],
  selectItem: (val: string) => void,
  getDisplayName?: (item: string) => string
) {
  return (
    <div className="relative">
      <ul className="absolute w-max bg-white mt-2 -right-2 rounded border shadow-2xl z-10 opacity-100">
        {items.map((item) => {
          return (
            <DropdownItem
              key={item}
              selectItem={selectItem}
              item={item}
              displayName={getDisplayName?.(item)}
            />
          );
        })}
      </ul>
    </div>
  );
}

function DropdownItem(props: {
  item: string;
  selectItem: (val: string) => void;
  displayName?: string;
}) {
  const { item, selectItem, displayName } = props;

  const handleClick = useCallback(() => {
    selectItem(item);
  }, [item, selectItem]);

  return (
    <li
      className="hover:bg-gray-100 px-4 py-1 cursor-pointer flex justify-between"
      onClick={handleClick}
    >
      {displayName ?? item}
    </li>
  );
}
