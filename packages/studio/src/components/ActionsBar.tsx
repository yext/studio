import AddElementButton from "./AddElementButton";
import UndoRedo from "./UndoRedo";
import SaveButton from "./SaveButton";
import DeployButton from "./DeployButton";
import OpenLivePreviewButton from "./OpenLivePreviewButton";
import ViewportButton from "./Viewport/ViewportButton";
import InfoButton from "./InfoButton";
import useStudioStore from "../store/useStudioStore";

/**
 * Renders the top bar of Studio, which includes buttons for performing undo
 * and redo actions, and adding elements.
 */
export default function ActionsBar(): JSX.Element {
  const [studioInCBD, layouts] = useStudioStore((store) => [
    store.studioEnvData.isWithinCBD,
    store.layouts.layouts,
  ]);
  console.log(layouts);
  return (
    <div className="flex bg-gray-100 py-3 items-center px-4">
      <AddElementButton />
      <div className="ml-auto h-7">
        <InfoButton />
      </div>
      {!studioInCBD && (
        <div className="ml-4">
          <OpenLivePreviewButton />
        </div>
      )}
      <div className="ml-2 flex items-center">
        <div className="mr-2">
          <ViewportButton />
        </div>
        <UndoRedo />
      </div>
      {!studioInCBD && <SaveButton />}
      <DeployButton />
    </div>
  );
}
