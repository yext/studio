import AddElementButton from "./AddElementButton";
import UndoRedo from "./UndoRedo";
import SaveButton from "./SaveButton";
import DeployButton from "./DeployButton";
import gitData from "virtual_yext-studio-git-data";
import OpenLivePreviewButton from "./OpenLivePreviewButton";
import ViewportButton from "./Viewport/ViewportButton";
import { ViewportStyles } from "./Viewport/defaults";
import { Dispatch, SetStateAction } from "react";

/**
 * Renders the top bar of Studio, which includes buttons for performing undo
 * and redo actions, and adding elements.
 */
export default function ActionsBar(props: {
  setViewportDimensions: Dispatch<SetStateAction<ViewportStyles>>;
}): JSX.Element {
  const { setViewportDimensions } = props;
  return (
    <div className="flex bg-gray-100 py-3 items-center px-4">
      <AddElementButton />
      <div className="ml-auto">
        <OpenLivePreviewButton />
      </div>
      <div className="ml-2 flex items-center">
        <div className="mr-2">
          <ViewportButton setViewportDimensions={setViewportDimensions} />
        </div>
        <UndoRedo />
      </div>
      {!gitData.isWithinCBD && <SaveButton />}
      <DeployButton />
    </div>
  );
}
