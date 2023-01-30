import ActionIconWrapper from "./ActionIconWrapper";
import { ReactComponent as DetachModuleIcon } from "../../icons/detachmodule.svg"
import { useCallback } from "react";

export default function DetachModuleButton() {
  const handleClick = useCallback(() => {
    console.log('boop')
  }, [])
  return (
    <button onClick={handleClick}>
      <ActionIconWrapper tooltip="Detach">
        <DetachModuleIcon />
      </ActionIconWrapper>
    </button>
  )
}