import Select, { MultiValue } from "react-select";
import useStudioStore from "../../store/useStudioStore";
import StreamScopeFieldLabel from "./StreamScopeFieldLabel";
import { ChangeEvent, useCallback, useMemo, useState } from "react";
import classNames from "classnames";
import getSelectCssClasses from "../../utils/getSelectCssClasses";

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
  const [maxPage, setMaxPage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const availableEntityTypes = Object.entries(entitiesRecord)
    .filter(([_entityType, entityData]) => {
      return Object.values(entityData).length > 0;
    })
    .map((entry) => entry[0]);

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
    setIsLoading(true);
    await fetchEntities(entityType, maxPage + 1);
    setIsLoading(false);
    setMaxPage(maxPage + 1);
  }, [entityType, fetchEntities, maxPage]);

  if (availableEntityTypes.length === 0) {
    const className = classNames({
      "bg-gray-50": disabled,
    });
    return (
      <div className={className}>No entity types found in the account.</div>
    );
  }

  return (
    <div className="flex flex-col mb-1">
      <StreamScopeFieldLabel streamScopeField="entityIds" />
      <label className="mt-2 text-sm flex flex-col">
        {!disabled && "Choosing from entities of type:"}
        <select
          className={getSelectCssClasses()}
          onChange={onEntityTypeChange}
          disabled={disabled}
        >
          {!disabled &&
            availableEntityTypes.map((entityType) => (
              <option key={entityType}>{entityType}</option>
            ))}
        </select>
      </label>
      {!disabled && (
        <Select
          className="my-2"
          isMulti={true}
          onChange={onEntityIdChange}
          value={selectedOptions}
          options={entityOptions}
          onMenuScrollToBottom={onMenuScrollToBottom}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}

function useEntityOptions(entityType?: string) {
  const entitiesRecord = useStudioStore(
    (store) => store.accountContent.entitiesRecord
  );

  return useMemo(() => {
    if (!entityType) {
      return [];
    }
    return Object.values(entitiesRecord[entityType] ?? []).map(
      (entityData) => ({
        value: entityData.id,
        label: `${entityData.displayName} (id: ${entityData.id})`,
      })
    );
  }, [entitiesRecord, entityType]);
}
