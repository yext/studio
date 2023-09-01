import { Tooltip } from "react-tooltip";
import PillPickerInput from "../PillPicker/PillPickerInput";
import { streamScopeFormData } from "../PageSettingsButton/EntityPageModal";
import { StreamScope } from "@yext/studio-plugin";
import { useCallback } from "react";

// TODO (SLAP-2918): Combine this with streamScopeFormData once this component
// is used for page settings
const emptyTextData: { [field in keyof StreamScope]: string } = {
  entityIds: "No entities found in the account.",
  entityTypes: "No entity types found in the account.",
  savedFilterIds: "No saved filters found in the account.",
};

export interface ScopeFilterFieldProps {
  field: string;
  allItems: {
    id: string;
    displayName?: string;
  }[];
  selectedIds: string[] | undefined;
  updateFilterFieldIds: (selectedIds: string[]) => void;
  disabled?: boolean;
}

export default function ScopeFilterField({
  field,
  allItems,
  selectedIds,
  updateFilterFieldIds,
  disabled,
}: ScopeFilterFieldProps) {
  const { tooltip, description } = streamScopeFormData[field];
  const availableIds = allItems
    .map((item) => item.id)
    .filter((i) => !selectedIds?.includes(i));

  const getDisplayName = useCallback(
    (id: string) => {
      const item = allItems.find((f) => f.id === id);
      const displayName = item?.displayName;
      return displayName ? `${displayName} (id: ${id})` : id;
    },
    [allItems]
  );

  return (
    <>
      <label id={field}>{description}</label>
      <Tooltip anchorSelect={`#${field}`} content={tooltip} />
      <PillPickerInput
        selectedItems={selectedIds}
        availableItems={availableIds}
        updateSelectedItems={updateFilterFieldIds}
        getDisplayName={getDisplayName}
        disabled={disabled}
        customContainerClasses="mt-2 mb-4 border-gray-500"
        emptyText={emptyTextData[field]}
      />
    </>
  );
}
