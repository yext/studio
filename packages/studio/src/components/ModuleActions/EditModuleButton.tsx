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
  const setModuleUUIDBeingEdited = useStudioStore(store => store.pages.setModuleUUIDBeingEdited);

  const handleClick = useCallback(() => {
    setModuleUUIDBeingEdited(moduleState.uuid);
  }, [moduleState.uuid, setModuleUUIDBeingEdited]);

  return (
    <button onClick={handleClick}>
      <ActionIconWrapper tooltip="Edit">
        <EditModuleIcon />
      </ActionIconWrapper>
    </button>
  );
}
