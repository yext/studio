import useStudioStore from "../store/useStudioStore";
import AddElementButton from "./AddElementButton";
import DeployButton from "./DeployButton";
import SaveButton from "./SaveButton";
import UndoRedo from "./UndoRedo";

/**
 * Renders the top bar of Studio, which includes buttons for performing undo
 * and redo actions, and adding elements.
 */
export default function ActionsBar(): JSX.Element {
  const activePageName = useStudioStore((store) => store.pages.activePageName);
  return (
    <div className="flex bg-gray-100 h-full items-center px-4 gap-4 border-b">
      {/* <YextSeal /> */}
      <div className="flex items-center gap-4 flex-grow">
        <AddElementButton />
      </div>
      <div className="flex-grow flex items-center justify-center">
        <div className="text-gray-700">{activePageName}</div>
      </div>
      <div className="flex items-center gap-4 flex-grow justify-end">
        <UndoRedo />
        <SaveButton />
        <DeployButton />
      </div>
    </div>
  );
}
