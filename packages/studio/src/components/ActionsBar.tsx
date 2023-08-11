import AddElementButton from "./AddElementButton";
import UndoRedo from "./UndoRedo";
import SaveButton from "./SaveButton";
import DeployButton from "./DeployButton";
import gitData from "virtual_yext-studio-git-data";
import OpenLivePreviewButton from "./OpenLivePreviewButton";

/**
 * Renders the top bar of Studio, which includes buttons for performing undo
 * and redo actions, and adding elements.
 */
export default function ActionsBar(): JSX.Element {
  return (
    <div className="flex bg-gray-100 py-3 items-center px-4">
      <AddElementButton />
      <div className="ml-auto">
        <OpenLivePreviewButton />
      </div>
      <div className="ml-8 flex">
        <UndoRedo />
      </div>
      {!gitData.isWithinCBD && <SaveButton />}
      <DeployButton />
    </div>
  );
}
