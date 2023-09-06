import Select, { MultiValue } from "react-select";
import useStudioStore from "../../store/useStudioStore";
import StreamScopeFieldLabel from "./StreamScopeFieldLabel";
import { ChangeEvent, useCallback, useMemo, useState } from "react";
import classNames from "classnames";
import getSelectCssClasses from "../../utils/getSelectCssClasses";

interface Props {
  disabled: boolean;
  updateSelection: (selectedIds: string[]) => void;
}

export default function EntityIdField({ disabled, updateSelection }: Props) {
  const entitiesRecord = useStudioStore(
    (store) => store.accountContent.entitiesRecord
  );

  const availableEntityTypes = Object.entries(entitiesRecord)
    .filter(([_entityType, entityData]) => {
      return Object.values(entityData).length > 0;
    })
    .map((entry) => entry[0]);

  const [entityType, setEntityType] = useState<string | undefined>(
    availableEntityTypes[0]
  );
  const entityOptions = useEntityOptions(entityType);

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

  if (availableEntityTypes.length === 0) {
    const className = classNames({
      "bg-gray-50": disabled,
    });
    return (
      <div className={className}>No entity types found in the account.</div>
    );
  }

  return (
    <div className="flex flex-col">
      <StreamScopeFieldLabel streamScopeField="entityIds" />
      <label className="mt-2 text-sm flex flex-col">
        Choosing entities of type:
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
          options={entityOptions}
          isMulti={true}
          onChange={onEntityIdChange}
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
        label: entityData.displayName,
      })
    );
  }, [entitiesRecord, entityType]);
}
