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
  const { setActiveModuleState, setActivePageName } = useStudioStore(
    (store) => store.pages
  );

  const handleClick = useCallback(() => {
    setActiveModuleState(moduleState);
    setActivePageName(undefined);
  }, [moduleState, setActiveModuleState, setActivePageName]);

  return (
    <button onClick={handleClick}>
      <ActionIconWrapper tooltip="Edit">
        <EditModuleIcon />
      </ActionIconWrapper>
    </button>
  );
}
