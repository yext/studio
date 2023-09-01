import ActionIconWrapper from "./ActionIconWrapper";
import { ReactComponent as DetachModuleIcon } from "../../icons/detachmodule.svg";
import { useCallback } from "react";
import {
  ComponentStateHelpers,
  ModuleMetadata,
  ModuleState,
  RepeaterState,
  TypeGuards,
} from "@yext/studio-plugin";
import useStudioStore from "../../store/useStudioStore";

export default function DetachModuleButton(props: {
  metadata: ModuleMetadata;
  state: ModuleState | RepeaterState;
}) {
  const { metadata, state } = props;
  const detachModuleInstance = useStudioStore(
    (store) => store.actions.detachModuleInstance
  );

  const isRepeater = TypeGuards.isRepeaterState(state);

  const handleClick = useCallback(() => {
    !isRepeater && detachModuleInstance(metadata, state);
  }, [detachModuleInstance, metadata, state, isRepeater]);

  const moduleName =
    ComponentStateHelpers.extractRepeatedState(state).componentName;
  const tooltipText = isRepeater
    ? "Unable to detach module instance since it is in a list"
    : "Detach";

  return (
    <button
      onClick={handleClick}
      aria-label={`Detach Module ${moduleName}`}
      disabled={isRepeater}
    >
      <ActionIconWrapper tooltip={tooltipText} disabled={isRepeater}>
        <DetachModuleIcon />
      </ActionIconWrapper>
    </button>
  );
}
