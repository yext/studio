import useTemporalStore from "../store/useTemporalStore";
import { ReactComponent as Undo } from "../icons/undo.svg";
import { useCallback, useEffect } from "react";
import classNames from "classnames";

/**
 * Buttons for undo and redo actions.
 */
export default function UndoRedo(): JSX.Element {
  const [undo, redo, pastStates, futureStates] = useTemporalStore((store) => [
    store.undo,
    store.redo,
    store.pastStates,
    store.futureStates,
  ]);

  const handleUndo = useCallback(() => {
    undo();
  }, [undo]);

  const handleRedo = useCallback(() => {
    redo();
  }, [redo]);

  const handleUndoKeydown = useCallback(
    (event: KeyboardEvent) => {
      event.preventDefault();
      if ((event.ctrlKey || event.metaKey) && event.key === "z") {
        undo();
      }
    },
    [undo]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleUndoKeydown);
  }, [handleUndoKeydown]);

  const disableUndo = pastStates.length === 0;
  const disableRedo = futureStates.length === 0;
  const undoClasses = classNames("w-4", {
    "text-gray-400": disableUndo,
    "text-gray-800": !disableUndo,
  });
  const redoClasses = classNames("w-4 mx-4 scale-x-[-1]", {
    "text-gray-400": disableRedo,
    "text-gray-800": !disableRedo,
  });

  return (
    <>
      <button
        className={undoClasses}
        onClick={handleUndo}
        disabled={disableUndo}
        aria-label="Undo"
      >
        <Undo />
      </button>
      <button
        className={redoClasses}
        onClick={handleRedo}
        disabled={disableRedo}
        aria-label="Redo"
      >
        {/* TODO: replace icon if UX has a different one in mind */}
        <Undo />
      </button>
    </>
  );
}
