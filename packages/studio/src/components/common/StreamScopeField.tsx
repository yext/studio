import PillPickerInput from "../PillPicker/PillPickerInput";
import { useCallback } from "react";
import StreamScopeFieldLabel from "../AddPageButton/StreamScopeFieldLabel";

// TODO (SLAP-2918): Combine this with streamScopeFormData once this component
// is used for page settings
const emptyTextData = {
  entityTypes: "No entity types found in the account.",
  savedFilterIds: "No saved filters found in the account.",
};

export interface StreamScopeFieldProps {
  streamScopeField: "entityTypes" | "savedFilterIds";
  options: {
    id: string;
    displayName?: string;
  }[];
  selectedIds: string[] | undefined;
  updateSelection: (selectedIds: string[]) => void;
  disabled?: boolean;
}

export default function StreamScopeField({
  streamScopeField,
  options,
  selectedIds,
  updateSelection,
  disabled,
}: StreamScopeFieldProps) {
  const availableIds = options
    .map((option) => option.id)
    .filter((id) => !selectedIds?.includes(id));

  const getDisplayName = useCallback(
    (id: string) => {
      const option = options.find((o) => o.id === id);
      const displayName = option?.displayName;
      return displayName ? `${displayName} (id: ${id})` : id;
    },
    [options]
  );
  const displayedSelectedItems = availableIds.length ? selectedIds : [];

  return (
    <>
      <StreamScopeFieldLabel streamScopeField={streamScopeField} />
      <div className="mt-2 mb-4">
        <PillPickerInput
          selectedItems={displayedSelectedItems}
          availableItems={availableIds}
          updateSelectedItems={updateSelection}
          getDisplayName={getDisplayName}
          disabled={disabled}
          emptyText={emptyTextData[streamScopeField]}
        />
      </div>
    </>
  );
}
