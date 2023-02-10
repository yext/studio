import useStudioStore from "../store/useStudioStore";
import { useCallback, useState } from "react";
import gitData from 'virtual:yext-studio-git-data'

console.log(gitData)

/**
 * Renders a button for saving, committing, and pushing changes..
 */
export default function DeployButton() {
  const deploy = useStudioStore((store) => store.actions.deploy);
  const [deployInProgress, setDeployInProgress] = useState(false);

  const handleClick = useCallback(async () => {
    setDeployInProgress(true);
    await deploy();
    setDeployInProgress(false);
  }, [deploy, setDeployInProgress]);

  return (
    <button
      className="ml-4 py-1 px-3 text-white rounded-md disabled:bg-gray-400 bg-blue-600 hover:bg-blue-500"
      onClick={handleClick}
      disabled={deployInProgress && gitData.canPush.status}
      aria-label="Deploy Changes to Repository"
    >
      Deploy
    </button>
  );
}
