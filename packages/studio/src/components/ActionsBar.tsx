import AddElementButton from "./AddElementButton";
import UndoRedo from "./UndoRedo";
import SaveButton from "./SaveButton";
import DeployButton from "./DeployButton";
import gitData from "virtual:yext-studio-git-data";

/**
 * Renders the top bar of Studio, which includes buttons for performing undo
 * and redo actions, and adding elements.
 */
export default function ActionsBar(): JSX.Element {
  return (
    <div className="flex bg-gray-100 py-3 items-center px-4">
      <AddElementButton />
      <div className="ml-auto flex">
        <UndoRedo />
      </div>
      {!gitData.isWithinCBD && <SaveButton />}
      <DeployButton />
    </div>
  );
}
