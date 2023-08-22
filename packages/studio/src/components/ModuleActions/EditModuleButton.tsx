import {
  ComponentStateHelpers,
  ModuleState,
  RepeaterState,
} from "@yext/studio-plugin";
import { useCallback } from "react";
import { ReactComponent as EditModuleIcon } from "../../icons/editmodule.svg";
import useStudioStore from "../../store/useStudioStore";
import ActionIconWrapper from "./ActionIconWrapper";

export default function EditModuleButton({
  state,
}: {
  state: ModuleState | RepeaterState;
}) {
  const [setModuleUUIDBeingEdited, updateActiveComponent] = useStudioStore(
    (store) => [
      store.pages.setModuleUUIDBeingEdited,
      store.pages.updateActiveComponent,
    ]
  );

  const handleClick = useCallback(() => {
    updateActiveComponent(undefined);
    setModuleUUIDBeingEdited(state.uuid);
  }, [state.uuid, setModuleUUIDBeingEdited, updateActiveComponent]);

  const moduleName =
    ComponentStateHelpers.extractRepeatedState(state).componentName;

  return (
    <button onClick={handleClick} aria-label={`Edit Module ${moduleName}`}>
      <ActionIconWrapper tooltip="Edit">
        <EditModuleIcon />
      </ActionIconWrapper>
    </button>
  );
}
