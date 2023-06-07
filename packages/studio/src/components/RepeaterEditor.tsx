import { EditableComponentState, TypeGuards } from "@yext/studio-plugin";
import { useCallback, ChangeEvent } from "react";
import { Tooltip } from "react-tooltip";
import useStudioStore from "../store/useStudioStore";
import FieldPickerInput from "./FieldPicker/FieldPickerInput";
import Toggle from "./common/Toggle";

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

  const onToggle = useCallback(() => {
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
            displayValue={componentState.listExpression}
            onInputChange={handleListUpdate}
            handleFieldSelection={updateListExpression}
            fieldFilter={Array.isArray}
          />
        </label>
      )}
    </>
  );
}
