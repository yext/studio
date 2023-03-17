import {
  EditableComponentState,
  TypeGuards,
} from "@yext/studio-plugin";
import { useCallback, ChangeEvent } from "react";
import useStudioStore from "../store/useStudioStore";

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

  const componentUUID = componentState.uuid;
  const onToggleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const checked = e.target.checked;
      checked ? addRepeater(componentUUID) : removeRepeater(componentUUID);
    },
    [addRepeater, removeRepeater, componentUUID]
  );

  const handleListUpdate = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      updateRepeaterListExpression(e.target.value);
    },
    [updateRepeaterListExpression]
  );

  const isChecked = TypeGuards.isRepeaterState(componentState);

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
