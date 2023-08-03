import useStudioStore from "../store/useStudioStore";
import { ReactComponent as X } from "../icons/x.svg";
import { useCallback } from "react";

interface RemoveElementButtonProps {
  /** The uuid of the element to be removed. */
  elementUUID: string;
}

/**
 * Renders a button for removing an element from the component tree of the
 * active page.
 */
export default function RemoveElementButton({
  elementUUID,
}: RemoveElementButtonProps): JSX.Element | null {
  const [removeComponent, clearSelectedComponents, activeComponentUUID, selectedComponentUUIDs] = useStudioStore(
    (store) => {return [
      store.actions.removeComponent,
      store.pages.clearSelectedComponents,
      store.pages.activeComponentUUID,
      store.pages.selectedComponentUUIDs,
    ]}
  );

  const handleClick = useCallback(() => {
    if (elementUUID !== activeComponentUUID) removeComponent(elementUUID);
    else {
      selectedComponentUUIDs.forEach((uuid) => removeComponent(uuid));
      clearSelectedComponents();
    }
  }, [elementUUID, activeComponentUUID, removeComponent, clearSelectedComponents, selectedComponentUUIDs]);

  return (
    <button onClick={handleClick} aria-label="Remove Element">
      <X />
    </button>
  );
}
