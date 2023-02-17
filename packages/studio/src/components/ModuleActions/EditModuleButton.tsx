import { ModuleState } from "@yext/studio-plugin";
import { useCallback } from "react";
import { ReactComponent as EditModuleIcon } from "../../icons/editmodule.svg";
import useStudioStore from "../../store/useStudioStore";
import ActionIconWrapper from "./ActionIconWrapper";

export default function EditModuleButton({
  moduleState,
}: {
  moduleState: ModuleState;
}) {
  const [setModuleUUIDBeingEdited, setActiveComponentUUID] = useStudioStore(
    (store) => [
      store.pages.setModuleUUIDBeingEdited,
      store.pages.setActiveComponentUUID,
    ]
  );

  const handleClick = useCallback(() => {
    setModuleUUIDBeingEdited(moduleState.uuid);
    setActiveComponentUUID(undefined);
  }, [moduleState.uuid, setModuleUUIDBeingEdited, setActiveComponentUUID]);

  return (
    <button
      onClick={handleClick}
      aria-label={`Edit Module ${moduleState.componentName}`}
    >
      <ActionIconWrapper tooltip="Edit">
        <EditModuleIcon />
      </ActionIconWrapper>
    </button>
  );
}
