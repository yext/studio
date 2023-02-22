import { useCallback } from "react";
import { ReactComponent as X } from "../icons/x.svg";
import useStudioStore from "../store/useStudioStore";

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
  const removeComponent = useStudioStore(
    (store) => store.actions.removeComponent
  );

  const handleClick = useCallback(() => {
    removeComponent(elementUUID);
  }, [elementUUID, removeComponent]);

  return (
    <button
      onClick={handleClick}
      aria-label="Remove Element"
      className="hidden group-hover:block"
    >
      <X />
    </button>
  );
}
