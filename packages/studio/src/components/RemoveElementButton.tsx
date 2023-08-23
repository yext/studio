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
  const [removeComponent, selectedComponentUUIDs] =
    useStudioStore((store) => {
      return [
        store.actions.removeComponent,
        store.pages.selectedComponentUUIDs,
      ];
    });

  const handleClick = useCallback(() => {
    selectedComponentUUIDs.forEach((uuid) => removeComponent(uuid));
  }, [
    removeComponent,
    selectedComponentUUIDs,
  ]);

  return (
    <button onClick={handleClick} aria-label="Remove Element">
      <X />
    </button>
  );
}
