import classNames from "classnames";
import { useCallback } from "react";
import { ReactComponent as Undo } from "../icons/undo.svg";
import useTemporalStore from "../store/useTemporalStore";

/**
 * Buttons for undo and redo actions.
 */
export default function UndoRedo(): JSX.Element {
  const { undo, redo, pastStates, futureStates } = useTemporalStore();

  const handleUndo = useCallback(() => {
    undo();
  }, [undo]);

  const handleRedo = useCallback(() => {
    redo();
  }, [redo]);

  const disableUndo = pastStates.length === 0;
  const disableRedo = futureStates.length === 0;
  const undoClasses = classNames("w-4", {
    "text-gray-400": disableUndo,
    "text-gray-800": !disableUndo,
  });
  const redoClasses = classNames("w-4 scale-x-[-1]", {
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
