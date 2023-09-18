import { useCallback } from "react";
import { ReactComponent as X } from "../../icons/x.svg";
import classNames from "classnames";
import PillPicker from "./PillPicker";

export const pillContainerClass =
  "flex flex-wrap min-h-[38px] items-center border border-gray-400 rounded-lg pt-2 pb-1 px-2 w-full text-sm";

interface PillPickerInputProps {
  selectedItems: string[] | undefined;
  availableItems: string[] | undefined;
  updateSelectedItems: (selectedItems: string[]) => void;
  emptyText: string;
  getDisplayName?: (item: string) => string;
  disabled?: boolean;
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
}: PillPickerInputProps) {
  const hasAvailableItems = !!availableItems?.length;
  const isEmptyAndNoAvailbleItems =
    !hasAvailableItems && !selectedItems?.length;

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

  const containerClasses = classNames(pillContainerClass, {
    "bg-gray-50": disabled || isEmptyAndNoAvailbleItems,
    "pb-2 text-gray-500": isEmptyAndNoAvailbleItems,
  });

  if (isEmptyAndNoAvailbleItems && !disabled) {
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
            disabled={disabled}
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
  disabled?: boolean;
}) {
  const { item, removeItem, displayName, disabled } = props;

  const handleClick = useCallback(() => {
    removeItem(item);
  }, [item, removeItem]);

  return (
    <button
      className="mr-1 mb-1 flex bg-sky-100 rounded px-1 hover:bg-red-100 items-center whitespace-nowrap hover:cursor-pointer disabled:bg-gray-200 "
      onClick={handleClick}
      disabled={disabled}
    >
      {displayName ?? item}
      <X className="ml-1" />
    </button>
  );
}
