import { useCallback, useContext, useEffect, useMemo } from "react";
import DialogModal from "../common/DialogModal";
import { FlowStepModalProps } from "./FlowStep";
import AddPageContext from "./AddPageContext";
import { Tooltip } from "react-tooltip";
import useStudioStore from "../../store/useStudioStore";
import { StreamScope } from "@yext/studio-plugin";
import PillPickerInput from "../PillPicker/PillPickerInput";
import { streamScopeFormData } from "../PageSettingsButton/EntityPageModal";

export default function StreamScopeCollector({
  isOpen,
  handleClose,
  handleConfirm,
}: FlowStepModalProps) {
  const { state, actions } = useContext(AddPageContext);
  const { streamScope } = state;
  const { setStreamScope } = actions;
  const [savedFilters, entitiesRecord] = useStudioStore((store) => [
    store.accountContent.savedFilters,
    store.accountContent.entitiesRecord,
  ]);

  useEffect(() => {
    if (streamScope === undefined) {
      setStreamScope({});
    }
  }, [setStreamScope, streamScope]);

  const updateScopeItems = useCallback(
    (field: string) => (selectedItems: string[] | undefined) => {
      const updatedStreamScope = {
        ...streamScope,
        [field]: selectedItems,
      };
      if (!selectedItems?.length) {
        delete updatedStreamScope[field];
      }
      setStreamScope(updatedStreamScope);
    },
    [streamScope, setStreamScope]
  );

  const scopeFormData: {
    [field in keyof StreamScope]: Pick<
      ScopeFieldProps,
      "emptyText" | "allItems" | "getDisplayName"
    >;
  } = useMemo(
    () => ({
      entityIds: {
        emptyText: "No entities found in the account.",
        // TODO (SLAP-2907): Populate dropdown from store
        allItems: [],
      },
      entityTypes: {
        emptyText: "No entity types found in the account.",
        allItems: Object.keys(entitiesRecord),
      },
      savedFilterIds: {
        emptyText: "No saved filters found in the account.",
        allItems: savedFilters.map((f) => f.id),
        getDisplayName: (item) => {
          const savedFilter = savedFilters.find((f) => f.id === item);
          return savedFilter ? getDisplayString(savedFilter) : item;
        },
      },
    }),
    [savedFilters, entitiesRecord]
  );

  const modalBodyContent = useMemo(() => {
    const totalStreamScopeItems = Object.values(streamScope ?? {}).reduce(
      (numItems, scopeItems) => {
        return numItems + scopeItems.length;
      },
      0
    );

    return (
      <>
        <div className="italic mb-4">
          Use one of the optional fields below to specify which entities this
          page can access.
        </div>
        {Object.entries(scopeFormData).map(([field, data]) => {
          const selectedItems: string[] | undefined = streamScope?.[field];
          const hasOtherScopeFilters =
            totalStreamScopeItems > (selectedItems?.length ?? 0);
          return (
            <ScopeField
              key={field}
              field={field}
              selectedItems={selectedItems}
              updateScopeItems={updateScopeItems(field)}
              disabled={data.allItems.length > 0 && hasOtherScopeFilters}
              {...streamScopeFormData[field]}
              {...data}
            />
          );
        })}
      </>
    );
  }, [scopeFormData, streamScope, updateScopeItems]);

  return (
    <DialogModal
      isOpen={isOpen}
      title="Content Scope"
      handleClose={handleClose}
      handleConfirm={handleConfirm}
      body={modalBodyContent}
      confirmButtonText="Next"
      isConfirmButtonDisabled={false}
    />
  );
}

interface ScopeFieldProps {
  field: string;
  description: string;
  allItems: string[];
  tooltip: string;
  emptyText: string;
  selectedItems: string[] | undefined;
  updateScopeItems: (selectedItems: string[] | undefined) => void;
  getDisplayName?: (item: string) => string;
  disabled?: boolean;
}

function ScopeField({
  field,
  description,
  allItems,
  tooltip,
  emptyText,
  selectedItems,
  updateScopeItems,
  getDisplayName,
  disabled,
}: ScopeFieldProps) {
  const addItem = useCallback(
    (item: string) => {
      updateScopeItems([...(selectedItems ?? []), item]);
    },
    [selectedItems, updateScopeItems]
  );

  const removeItem = useCallback(
    (item: string) => {
      updateScopeItems(selectedItems?.filter((i) => i !== item));
    },
    [selectedItems, updateScopeItems]
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

function getDisplayString({
  id,
  displayName,
}: {
  id: string;
  displayName: string;
}) {
  return `${displayName} (id: ${id})`;
}
