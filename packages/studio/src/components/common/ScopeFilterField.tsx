import { useCallback } from "react";
import { Tooltip } from "react-tooltip";
import PillPickerInput from "../PillPicker/PillPickerInput";

export interface ScopeFilterFieldProps {
  field: string;
  description: string;
  allItems: string[];
  selectedItems: string[] | undefined;
  updateFilterFieldItems: (selectedItems: string[] | undefined) => void;
  tooltip: string;
  emptyText: string;
  getDisplayName?: (item: string) => string;
  disabled?: boolean;
}

export default function ScopeFilterField({
  field,
  description,
  allItems,
  selectedItems,
  updateFilterFieldItems,
  tooltip,
  emptyText,
  getDisplayName,
  disabled,
}: ScopeFilterFieldProps) {
  const addItem = useCallback(
    (item: string) => {
      updateFilterFieldItems([...(selectedItems ?? []), item]);
    },
    [selectedItems, updateFilterFieldItems]
  );

  const removeItem = useCallback(
    (item: string) => {
      updateFilterFieldItems(selectedItems?.filter((i) => i !== item));
    },
    [selectedItems, updateFilterFieldItems]
  );

  const availableItems = allItems.filter((i) => !selectedItems?.includes(i));
  const labelId = `${field}-label`;

  return (
    <>
      <label id={labelId}>{description}</label>
      <Tooltip anchorSelect={`#${labelId}`} content={tooltip} />
      <PillPickerInput
        selectedItems={selectedItems}
        availableItems={availableItems}
        selectItem={addItem}
        removeItem={removeItem}
        getDisplayName={getDisplayName}
        disabled={disabled}
        customContainerClasses="mt-2 mb-4 border-gray-500"
        emptyText={emptyText}
      />
    </>
  );
}
