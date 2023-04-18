import { useState } from "react";
import useStudioStore from "../store/useStudioStore";

/**
 * This hook returns whether or not the active component has changed.
 */
export function useHasActiveComponentChange(): boolean {
  const activeComponentUUIDInStore = useStudioStore().pages.activeComponentUUID;
  const [activeComponentUUID, setActiveComponentUUID] = useState(
    activeComponentUUIDInStore
  );

  if (activeComponentUUIDInStore !== activeComponentUUID) {
    setActiveComponentUUID(activeComponentUUIDInStore);
    return true;
  }
  return false;
}
