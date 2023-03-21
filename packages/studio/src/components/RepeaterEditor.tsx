import { EditableComponentState, TypeGuards } from "@yext/studio-plugin";
import { useCallback, ChangeEvent } from "react";
import { Tooltip } from "react-tooltip";
import useStudioStore from "../store/useStudioStore";
import Toggle from "./common/Toggle";

const tooltipAnchorID = "YextStudio-listRepeaterToggle";

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

  const onToggle = useCallback(() => {
    isChecked ? removeRepeater(componentState) : addRepeater(componentState);
  }, [addRepeater, removeRepeater, componentState, isChecked]);

  const handleListUpdate = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      isChecked && updateRepeaterListExpression(e.target.value, componentState);
    },
    [updateRepeaterListExpression, componentState, isChecked]
  );

  return (
    <>
      <div className="font-bold pb-2">Repeaters</div>
      <label className="flex mb-2">
        <span className="w-1/2">List</span>
        <Toggle
          id={tooltipAnchorID}
          checked={isChecked}
          disabled={activeComponentHasChildren}
          onToggle={onToggle}
        />
        {activeComponentHasChildren && (
          <Tooltip
            anchorId={tooltipAnchorID}
            content="Unable to list a container with children"
          />
        )}
      </label>
      {isChecked && (
        <label className="flex flex-col mb-2">
          <span>List Field</span>
          <input
            type="text"
            onChange={handleListUpdate}
            className="border border-gray-300 focus:border-indigo-500 rounded-lg p-2 w-full"
            value={componentState.listExpression}
          />
        </label>
      )}
    </>
  );
}
