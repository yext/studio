import AddElementButton from "./AddElementButton";
import UndoRedo from "./UndoRedo";
import SaveButton from "./SaveButton";
import DeployButton from "./DeployButton";
import gitData from "virtual_yext-studio-git-data";
import OpenLivePreviewButton from "./OpenLivePreviewButton";
import ViewportButton from "./Viewport/ViewportButton";
import VersionNumber from "./VersionNumber";

/**
 * Renders the top bar of Studio, which includes buttons for performing undo
 * and redo actions, and adding elements.
 */
export default function ActionsBar(): JSX.Element {
  return (
    <div className="flex bg-gray-100 py-3 items-center px-4">
      <AddElementButton />
      <div className="ml-auto">
        <VersionNumber />
      </div>
      <div className="ml-4">
        <OpenLivePreviewButton />
      </div>
      <div className="ml-2 flex items-center">
        <div className="mr-2">
          <ViewportButton />
        </div>
        <UndoRedo />
      </div>
      {!gitData.isWithinCBD && <SaveButton />}
      <DeployButton />
    </div>
  );
}
