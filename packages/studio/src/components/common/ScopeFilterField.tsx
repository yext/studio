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
  filterOptions: {
    id: string;
    displayName?: string;
  }[];
  selectedIds: string[] | undefined;
  updateFilterFieldIds: (selectedIds: string[]) => void;
  disabled?: boolean;
}

export default function ScopeFilterField({
  field,
  filterOptions,
  selectedIds,
  updateFilterFieldIds,
  disabled,
}: ScopeFilterFieldProps) {
  const { tooltip, description } = streamScopeFormData[field];
  const availableIds = filterOptions
    .map((option) => option.id)
    .filter((id) => !selectedIds?.includes(id));

  const getDisplayName = useCallback(
    (id: string) => {
      const option = filterOptions.find((o) => o.id === id);
      const displayName = option?.displayName;
      return displayName ? `${displayName} (id: ${id})` : id;
    },
    [filterOptions]
  );

  return (
    <>
      <label id={field}>{description}</label>
      <Tooltip anchorSelect={`#${field}`} content={tooltip} />
      <div className="mt-2 mb-4">
        <PillPickerInput
          selectedItems={selectedIds}
          availableItems={availableIds}
          updateSelectedItems={updateFilterFieldIds}
          getDisplayName={getDisplayName}
          disabled={disabled}
          emptyText={emptyTextData[field]}
        />
      </div>
    </>
  );
}
