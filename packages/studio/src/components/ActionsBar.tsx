import AddElementButton from "./AddElementButton";
import UndoRedo from "./UndoRedo";
import { ReactComponent as YextSeal } from "../icons/yextseal.svg";
import SaveButton from "./SaveButton";
import CreateModuleButton from "./CreateModuleButton";
import DeployButton from "./DeployButton";

/**
 * Renders the top bar of Studio, which includes buttons for performing undo
 * and redo actions, and adding elements.
 */
export default function ActionsBar(): JSX.Element {
  return (
    <div className="flex bg-gray-100 py-3 items-center px-4">
      <YextSeal />
      <div className="ml-4 mt-2">
        <AddElementButton />
      </div>
      <CreateModuleButton />
      <div className="ml-auto flex">
        <UndoRedo />
      </div>
      <SaveButton />
      <DeployButton/>
    </div>
  );
}
