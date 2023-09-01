import { useCallback } from "react";
import { ReactComponent as X } from "../../icons/x.svg";
import classNames from "classnames";
import PillPicker from "./PillPicker";
import { twMerge } from "tailwind-merge";

const pillContainerClass =
  "flex flex-wrap min-h-[38px] items-center border border-gray-300 rounded-lg pt-2 pb-1 px-2 w-full text-sm";

interface PillPickerInputProps {
  selectedItems: string[] | undefined;
  availableItems: string[] | undefined;
  updateSelectedItems: (selectedItems: string[]) => void;
  emptyText: string;
  getDisplayName?: (item: string) => string;
  disabled?: boolean;
  customContainerClasses?: string;
}

/**
 * An input displaying pills for each selected item and a PillPicker icon.
 */
export default function PillPickerInput({
  selectedItems,
  availableItems,
  updateSelectedItems,
  emptyText,
  getDisplayName,
  disabled,
  customContainerClasses,
}: PillPickerInputProps) {
  const hasAvailableItems = !!availableItems?.length;
  const isEmpty = !hasAvailableItems && !selectedItems?.length;

  const addItem = useCallback(
    (item: string) => {
      const updatedSelectedItems = new Set(selectedItems);
      updatedSelectedItems.add(item);
      updateSelectedItems([...updatedSelectedItems]);
    },
    [updateSelectedItems, selectedItems]
  );

  const removeItem = useCallback(
    (item: string) => {
      const updatedSelectedItems = new Set(selectedItems);
      updatedSelectedItems.delete(item);
      updateSelectedItems([...updatedSelectedItems]);
    },
    [updateSelectedItems, selectedItems]
  );

  const containerClasses = twMerge(
    classNames(pillContainerClass, {
      "bg-gray-50": disabled || isEmpty,
      "pb-2 text-gray-500": isEmpty,
    }),
    customContainerClasses
  );

  if (isEmpty && !disabled) {
    return <div className={containerClasses}>{emptyText}</div>;
  }

  return (
    <div className={containerClasses}>
      {selectedItems?.map((item) => {
        return (
          <Pill
            key={item}
            removeItem={removeItem}
            item={item}
            displayName={getDisplayName?.(item)}
          />
        );
      })}
      {hasAvailableItems && (
        <PillPicker
          availableItems={availableItems}
          selectItem={addItem}
          getDisplayName={getDisplayName}
          disabled={disabled}
        />
      )}
    </div>
  );
}

function Pill(props: {
  item: string;
  removeItem: (val: string) => void;
  displayName?: string;
}) {
  const { item, removeItem, displayName } = props;

  const handleClick = useCallback(() => {
    removeItem(item);
  }, [item, removeItem]);

  return (
    <div
      className="mr-1 mb-1 flex bg-sky-100 rounded px-1 hover:bg-sky-200 items-center whitespace-nowrap hover:cursor-pointer"
      onClick={handleClick}
    >
      {displayName ?? item}
      <X className="ml-1" />
    </div>
  );
}
