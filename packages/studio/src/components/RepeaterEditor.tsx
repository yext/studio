import {
  ComponentStateKind,
  RepeaterState,
  StandardOrModuleComponentState,
} from "@yext/studio-plugin";
import {
  useState,
  useCallback,
  ChangeEvent,
  useMemo,
  useLayoutEffect,
} from "react";
import useStudioStore from "../store/useStudioStore";

export default function RepeaterEditor({
  componentState,
}: {
  componentState: StandardOrModuleComponentState | RepeaterState;
}): JSX.Element {
  const [activeComponentTree, updateRepeaterList, addRepeater, removeRepeater] =
    useStudioStore((store) => [
      store.actions.getComponentTree(),
      store.actions.updateRepeaterList,
      store.actions.addRepeater,
      store.actions.removeRepeater,
    ]);
  const [isChecked, setIsChecked] = useState(
    componentState.kind === ComponentStateKind.Repeater
  );
  useLayoutEffect(() => {
    setIsChecked(componentState.kind === ComponentStateKind.Repeater);
  }, [setIsChecked, componentState]);

  const componentUUID = componentState.uuid;
  const onToggleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const checked = e.target.checked;
      setIsChecked(checked);
      checked ? addRepeater(componentUUID) : removeRepeater(componentUUID);
    },
    [setIsChecked, addRepeater, removeRepeater, componentUUID]
  );

  const handleListUpdate = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      updateRepeaterList(e.target.value);
    },
    [updateRepeaterList]
  );

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
            value={
              componentState.kind === ComponentStateKind.Repeater
                ? componentState.listField
                : ""
            }
          />
        </label>
      )}
    </>
  );
}
