import {
  ComponentStateKind,
  RepeaterState,
  StandardOrModuleComponentState,
} from "@yext/studio-plugin";
import { useCallback, ChangeEvent, useMemo } from "react";
import useStudioStore from "../store/useStudioStore";

export default function RepeaterEditor({
  componentState,
}: {
  componentState: StandardOrModuleComponentState | RepeaterState;
}): JSX.Element {
  const [
    activeComponentTree,
    updateRepeaterListExpression,
    addRepeater,
    removeRepeater,
  ] = useStudioStore((store) => [
    store.actions.getComponentTree(),
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

  const isChecked = componentState.kind === ComponentStateKind.Repeater;
  const hasChildren = useMemo(
    () => activeComponentTree?.some((c) => c.parentUUID === componentUUID),
    [activeComponentTree, componentUUID]
  );

  return (
    <>
      <div className="font-bold pb-2">Repeaters</div>
      <label className="flex mb-2">
        <span className="w-1/2">List</span>
        <input
          type="checkbox"
          checked={isChecked}
          disabled={hasChildren}
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
