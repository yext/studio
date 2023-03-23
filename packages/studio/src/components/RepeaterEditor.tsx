import { EditableComponentState, TypeGuards } from "@yext/studio-plugin";
import { ChangeEvent, useCallback } from "react";
import useStudioStore from "../store/useStudioStore";
import FieldPickerInput from "./FieldPicker/FieldPickerInput";

interface RepeaterEditorProps {
  componentState: EditableComponentState;
}

export default function RepeaterEditor({
  componentState,
}: RepeaterEditorProps): JSX.Element {
  const [
    activeComponentHasChildren,
    updateRepeaterListExpression,
    addRepeater,
    removeRepeater,
  ] = useStudioStore((store) => [
    store.actions.getActiveComponentHasChildren(),
    store.actions.updateRepeaterListExpression,
    store.actions.addRepeater,
    store.actions.removeRepeater,
  ]);

  const isChecked = TypeGuards.isRepeaterState(componentState);

  const onToggleChange = useCallback(() => {
    isChecked ? removeRepeater(componentState) : addRepeater(componentState);
  }, [addRepeater, removeRepeater, componentState, isChecked]);

  const updateListExpression = useCallback(
    (value: string) => {
      isChecked && updateRepeaterListExpression(value, componentState);
    },
    [componentState, isChecked, updateRepeaterListExpression]
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
        <input
          type="checkbox"
          checked={isChecked}
          disabled={activeComponentHasChildren}
          onChange={onToggleChange}
        />
      </label>
      {isChecked && (
        <label className="flex flex-col mb-2">
          <span>List Field</span>
          <FieldPickerInput
            displayValue={componentState.listExpression}
            onInputChange={handleListUpdate}
            handleFieldSelection={updateListExpression}
            fieldType="array"
          />
        </label>
      )}
    </>
  );
}
