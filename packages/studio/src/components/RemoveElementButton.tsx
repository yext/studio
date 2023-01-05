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
  const [getActivePageState, setActivePageState] = useStudioStore((store) => {
    const pages = store.pages;
    return [pages.getActivePageState, pages.setActivePageState];
  });

  const handleClick = useCallback(() => {
    const activePageState = getActivePageState();
    if (!activePageState) {
      throw new Error("Tried to remove component without active page state.");
    }
    const componentTree = activePageState.componentTree;
    const parentUUID = componentTree.find(
      (c) => c.uuid === elementUUID
    )?.parentUUID;
    const updatedComponentTree = componentTree
      .filter((c) => c.uuid !== elementUUID)
      .map((c) => {
        const updatedParentUUID =
          c.parentUUID === elementUUID ? parentUUID : c.parentUUID;
        return {
          ...c,
          parentUUID: updatedParentUUID,
        };
      });
    setActivePageState({
      ...activePageState,
      componentTree: updatedComponentTree,
    });
  }, [elementUUID, getActivePageState, setActivePageState]);

  return (
    <button onClick={handleClick} aria-label="Remove Element">
      <X />
    </button>
  );
}
