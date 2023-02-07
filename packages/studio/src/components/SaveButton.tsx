import useHasChanges from "../hooks/useHasChanges";
import useStudioStore from "../store/useStudioStore";

/**
 * Renders a button for saving changes to user's files.
 */
export default function SaveButton() {
  const hasChanges = useHasChanges();
  const saveChanges = useStudioStore((store) => store.actions.saveChanges);

  return (
    <button
      className="ml-4 py-1 px-3 text-white rounded-md disabled:bg-gray-400 bg-blue-600 hover:bg-blue-500"
      onClick={saveChanges}
      disabled={!hasChanges}
      aria-label="Save Changes to Repository"
    >
      Save
    </button>
  );
}
