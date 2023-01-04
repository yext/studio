import AddElementButton from "./AddElementButton";
import UndoRedo from "./UndoRedo";
import { ReactComponent as YextSeal } from "../icons/yextseal.svg";

/**
 * Renders the top bar of Studio, which includes buttons for performing undo
 * and redo actions, and adding elements.
 */
export default function ActionsBar(): JSX.Element {
  return (
    <div className="flex bg-gray-100 py-3 items-center">
      <YextSeal className="ml-4" />
      <div className="ml-4 mt-2">
        <AddElementButton />
      </div>
      <div className="ml-auto flex">
        <UndoRedo />
      </div>
    </div>
  );
}
