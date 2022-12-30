import useTemporalStore from "../store/useTemporalStore";
import { ReactComponent as Undo } from "../icons/undo.svg";
import { useCallback } from "react";
import classNames from "classnames";

/**
 * Renders the top bar of Studio, which includes buttons for performing undo
 * and redo actions.
 */
export default function ActionsBar(): JSX.Element {
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
    "text-gray-700": !disableUndo,
  });
  const redoClasses = classNames("w-4 mx-4 scale-x-[-1]", {
    "text-gray-400": disableRedo,
    "text-gray-700": !disableRedo,
  });

  return (
    <div className="flex bg-gray-100 py-3 justify-end">
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
    </div>
  );
}
