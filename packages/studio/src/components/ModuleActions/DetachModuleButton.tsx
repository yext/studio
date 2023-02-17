import ActionIconWrapper from "./ActionIconWrapper";
import { ReactComponent as DetachModuleIcon } from "../../icons/detachmodule.svg";
import { useCallback } from "react";
import { ModuleMetadata, ModuleState } from "@yext/studio-plugin";
import useStudioStore from "../../store/useStudioStore";

export default function DetachModuleButton(props: {
  metadata: ModuleMetadata;
  moduleState: ModuleState;
}) {
  const { metadata, moduleState } = props;
  const detachModuleInstance = useStudioStore(
    (store) => store.actions.detachModuleInstance
  );

  const handleClick = useCallback(() => {
    detachModuleInstance(metadata, moduleState);
  }, [detachModuleInstance, metadata, moduleState]);

  return (
    <button
      onClick={handleClick}
      aria-label={`Detach Module ${moduleState.componentName}`}
    >
      <ActionIconWrapper tooltip="Detach">
        <DetachModuleIcon />
      </ActionIconWrapper>
    </button>
  );
}
