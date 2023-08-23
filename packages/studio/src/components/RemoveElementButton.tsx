import useStudioStore from "../store/useStudioStore";
import { ReactComponent as X } from "../icons/x.svg";
import { useCallback } from "react";

interface RemoveElementButtonProps {}

/**
 * Renders a button for removing an element from the component tree of the
 * active page.
 */
export default function RemoveElementButton({}: RemoveElementButtonProps): JSX.Element | null {
  const [removeSelectedComponents, selectedComponentUUIDs] =
    useStudioStore((store) => {
      return [
        store.actions.removeSelectedComponents,
        store.pages.selectedComponentUUIDs,
      ];
    });

  return (
    <button onClick={removeSelectedComponents} aria-label="Remove Element">
      <X />
    </button>
  );
}
