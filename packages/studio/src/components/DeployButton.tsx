import useStudioStore from "../store/useStudioStore";
import useHasChanges from "../hooks/useHasChanges";

/**
 * Renders a button for saving, committing, and pushing changes..
 */
export default function DeployButton() {
  const hasChanges = useHasChanges();
  const deploy = useStudioStore((store) => store.actions.deploy);

  return (
    <button
      className="ml-4 py-1 px-3 text-white rounded-md disabled:bg-gray-400 bg-blue-600 hover:bg-blue-500"
      onClick={deploy}
      disabled={!hasChanges}
      aria-label="Deploy Changes to Repository"
    >
      Deploy
    </button>
  );
}
