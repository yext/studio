import { useEffect, useCallback } from "react";
import useStudioStore from "../store/useStudioStore";

/**
 * A useEffect for adding a keydown event listener to the document.
 */
export default function useDeleteKeyListener() {
  const [activeComponentUUID, removeComponent] = useStudioStore((store) => {
    return [store.pages.activeComponentUUID, store.actions.removeComponent];
  });

  const handleKeyPress = useCallback(
    (event) => {
      if (event.key === "Backspace" && activeComponentUUID) {
        if (
          document.activeElement?.id === `ComponentNode-${activeComponentUUID}`
        ) {
          removeComponent(activeComponentUUID);
        }
      }
    },
    [activeComponentUUID, removeComponent]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, [handleKeyPress]);
}
