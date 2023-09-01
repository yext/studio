import { useCallback, useContext } from "react";
import { Tooltip } from "react-tooltip";
import PillPickerInput from "../PillPicker/PillPickerInput";
import AddPageContext from "../AddPageButton/AddPageContext";

export interface ScopeFilterFieldProps {
  field: string;
  description: string;
  allItems: string[];
  selectedItems: string[] | undefined;
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
  tooltip,
  emptyText,
  getDisplayName,
  disabled,
}: ScopeFilterFieldProps) {
  const { actions } = useContext(AddPageContext);
  const { setStreamScope } = actions;

  const updateStreamScope = useCallback(
    (selectedItems: string[]) => {
      const updatedStreamScope = {
        ...(selectedItems.length && { [field]: selectedItems }),
      };
      setStreamScope(updatedStreamScope);
    },
    [field, setStreamScope]
  );

  const availableItems = allItems.filter((i) => !selectedItems?.includes(i));

  return (
    <>
      <label id={field}>{description}</label>
      <Tooltip anchorSelect={`#${field}`} content={tooltip} />
      <PillPickerInput
        selectedItems={selectedItems}
        availableItems={availableItems}
        updateSelectedItems={updateStreamScope}
        getDisplayName={getDisplayName}
        disabled={disabled}
        customContainerClasses="mt-2 mb-4 border-gray-500"
        emptyText={emptyText}
      />
    </>
  );
}
