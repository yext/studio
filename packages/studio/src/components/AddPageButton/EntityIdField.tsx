import Select, { MultiValue, StylesConfig } from "react-select";
import useStudioStore from "../../store/useStudioStore";
import StreamScopeFieldLabel from "./StreamScopeFieldLabel";
import { ChangeEvent, useCallback, useMemo, useState } from "react";
import { pillContainerClass } from "../PillPicker/PillPickerInput";
import classNames from "classnames";

interface Props {
  disabled: boolean;
  updateSelection: (selectedIds: string[]) => void;
  selectedIds?: string[];
}

export default function EntityIdField({
  disabled,
  updateSelection,
  selectedIds,
}: Props) {
  const [entitiesRecord, fetchEntities] = useStudioStore((store) => [
    store.accountContent.entitiesRecord,
    store.accountContent.fetchEntities,
  ]);
  const availableEntityTypes = Object.keys(entitiesRecord);
  const [isLoading, setIsLoading] = useState(false);
  const [entityType, setEntityType] = useState<string | undefined>(
    availableEntityTypes[0]
  );
  const entityOptions = useEntityOptions(entityType);
  const selectedOptions = useMemo(
    () => selectedIds?.map((id) => ({ value: id, label: id })),
    [selectedIds]
  );

  const onEntityTypeChange = useCallback(
    (e: ChangeEvent<HTMLSelectElement>) => {
      setEntityType(e.target.value);
    },
    []
  );

  const onEntityIdChange = useCallback(
    (selectedItems: MultiValue<{ value: string }>) => {
      updateSelection(selectedItems.map((item) => item.value));
    },
    [updateSelection]
  );

  const onMenuScrollToBottom = useCallback(async () => {
    if (!entityType) {
      return;
    }
    const currentNumEntities = entitiesRecord[entityType].entities.length;
    if (currentNumEntities >= entitiesRecord[entityType].totalCount) {
      return;
    }
    setIsLoading(true);
    await fetchEntities(entityType, Math.floor(currentNumEntities / 50));
    setIsLoading(false);
  }, [entitiesRecord, entityType, fetchEntities]);

  const containerClass = "flex flex-col mb-4";

  if (availableEntityTypes.length === 0) {
    return (
      <div className={containerClass}>
        <div>
          <StreamScopeFieldLabel streamScopeField="entityIds" />
        </div>
        <div
          className={classNames(
            pillContainerClass,
            "mt-2 bg-gray-50 text-gray-500 pb-2"
          )}
        >
          No entities found in the account.
        </div>
      </div>
    );
  }

  return (
    <div className={containerClass}>
      <div>
        <StreamScopeFieldLabel streamScopeField="entityIds" />
      </div>
      <div className="flex items-center mt-2">
        <select
          className="disabled:bg-gray-100 border border-r-0 border-gray-400 text-gray-900 focus:ring-blue-500 focus:border-blue-500 py-2 pl-1 pr-1 text-sm h-[38px] rounded-l-lg"
          onChange={onEntityTypeChange}
          disabled={disabled}
        >
          {availableEntityTypes.map((entityType) => (
            <option key={entityType}>{entityType}</option>
          ))}
        </select>
        <Select
          className="grow text-sm"
          isMulti={true}
          onChange={onEntityIdChange}
          value={selectedOptions}
          options={entityOptions}
          onMenuScrollToBottom={onMenuScrollToBottom}
          isLoading={isLoading}
          isSearchable={false}
          placeholder="Select entity ids..."
          styles={selectStyles}
          isDisabled={disabled}
        />
      </div>
    </div>
  );
}

const selectStyles = {
  control: (base) => ({
    ...base,
    borderTopLeftRadius: "0",
    borderBottomLeftRadius: "0",
    borderColor: "rgb(156, 163, 175)",
    borderTopRightRadius: "0.5rem",
    borderBottomRightRadius: "0.5rem",
  }),
} satisfies StylesConfig;

function useEntityOptions(entityType?: string) {
  const entitiesRecord = useStudioStore(
    (store) => store.accountContent.entitiesRecord
  );

  return useMemo(() => {
    if (!entityType) {
      return [];
    }
    return entitiesRecord[entityType]?.entities.map((entityData) => ({
      value: entityData.id,
      label: `${entityData.displayName} (id: ${entityData.id})`,
    }));
  }, [entitiesRecord, entityType]);
}
