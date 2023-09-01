import { Tooltip } from "react-tooltip";
import PillPickerInput from "../PillPicker/PillPickerInput";
import { streamScopeFormData } from "../PageSettingsButton/EntityPageModal";
import { StreamScope } from "@yext/studio-plugin";

// TODO (SLAP-2918): Combine this with streamScopeFormData once this component
// is used for page settings
const emptyTextData: { [field in keyof StreamScope]: string } = {
  entityIds: "No entities found in the account.",
  entityTypes: "No entity types found in the account.",
  savedFilterIds: "No saved filters found in the account.",
};

export interface ScopeFilterFieldProps {
  field: string;
  allItems: string[];
  selectedItems: string[] | undefined;
  updateFilterFieldItems: (selectedItems: string[]) => void;
  getDisplayName?: (item: string) => string;
  disabled?: boolean;
}

export default function ScopeFilterField({
  field,
  allItems,
  selectedItems,
  updateFilterFieldItems,
  getDisplayName,
  disabled,
}: ScopeFilterFieldProps) {
  const { tooltip, description } = streamScopeFormData[field];
  const availableItems = allItems.filter((i) => !selectedItems?.includes(i));

  return (
    <>
      <label id={field}>{description}</label>
      <Tooltip anchorSelect={`#${field}`} content={tooltip} />
      <PillPickerInput
        selectedItems={selectedItems}
        availableItems={availableItems}
        updateSelectedItems={updateFilterFieldItems}
        getDisplayName={getDisplayName}
        disabled={disabled}
        customContainerClasses="mt-2 mb-4 border-gray-500"
        emptyText={emptyTextData[field]}
      />
    </>
  );
}
