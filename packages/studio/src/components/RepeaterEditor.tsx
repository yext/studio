import { EditableComponentState, TypeGuards } from "@yext/studio-plugin";
import { useCallback, ChangeEvent, useState, useMemo } from "react";
import { Tooltip } from "react-tooltip";
import useStudioStore from "../store/useStudioStore";
import FieldPickerInput from "./FieldPicker/FieldPickerInput";
import Toggle from "./common/Toggle";
import { debounce } from "lodash";
import { useHasTemporalChange } from "../hooks/useHasTemporalChange";

const tooltipAnchorID = "YextStudio-listRepeaterToggle";

interface RepeaterEditorProps {
  componentState: EditableComponentState;
}

export default function RepeaterEditor({
  componentState,
}: RepeaterEditorProps): JSX.Element {
  const [
    hasChildren,
    updateRepeaterListExpression,
    addRepeater,
    removeRepeater,
  ] = useStudioStore((store) => [
    store.actions.getComponentHasChildren(componentState.uuid),
    store.actions.updateRepeaterListExpression,
    store.actions.addRepeater,
    store.actions.removeRepeater,
  ]);

  const isChecked = TypeGuards.isRepeaterState(componentState);
  const [listInputValue, setListInputValue] = useState(
    isChecked ? componentState.listExpression : ""
  );
  const hasTemporalChange = useHasTemporalChange();
  if (hasTemporalChange && isChecked) {
    setListInputValue(componentState.listExpression);
  }

  const onToggle = useCallback(() => {
    isChecked ? removeRepeater(componentState) : addRepeater(componentState);
    setListInputValue("");
  }, [addRepeater, removeRepeater, componentState, isChecked]);

  const debouncedUpdateRepeaterList = useMemo(
    () => debounce(updateRepeaterListExpression, 500),
    [updateRepeaterListExpression]
  );
  const updateListExpression = useCallback(
    (value: string) => {
      isChecked && debouncedUpdateRepeaterList(value, componentState);
      setListInputValue(value);
    },
    [componentState, isChecked, debouncedUpdateRepeaterList]
  );

  const handleListUpdate = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      updateListExpression(e.target.value);
    },
    [updateListExpression]
  );

  return (
    <>
      <div className="font-bold pb-2">Repeaters</div>
      <label className="flex mb-2">
        <span className="w-1/2">List</span>
        <Toggle
          id={tooltipAnchorID}
          checked={isChecked}
          disabled={hasChildren}
          onToggle={onToggle}
        />
        {hasChildren && (
          <Tooltip
            anchorId={tooltipAnchorID}
            content="Unable to list a container with children"
          />
        )}
      </label>
      {isChecked && (
        <label className="flex flex-col mb-2">
          <span>List Field</span>
          <FieldPickerInput
            displayValue={listInputValue}
            onInputChange={handleListUpdate}
            handleFieldSelection={updateListExpression}
            fieldType="array"
          />
        </label>
      )}
    </>
  );
}
