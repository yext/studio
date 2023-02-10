import useStudioStore from "../store/useStudioStore";
import { useCallback, useEffect, useState } from "react";
import gitData from "virtual:yext-studio-git-data";
import useHasChanges from "../hooks/useHasChanges";
import { Tooltip } from "react-tooltip";

const tooltipAnchorID = "YextStudio-deployButton";

/**
 * Renders a button for saving, committing, and pushing changes..
 */
export default function DeployButton() {
  const deploy = useStudioStore((store) => store.actions.deploy);
  const [deployInProgress, setDeployInProgress] = useState(false);
  const hasChanges = useHasChanges();

  const handleClick = useCallback(async () => {
    setDeployInProgress(true);
    await deploy();
  }, [deploy, setDeployInProgress]);

  useEffect(() => {
    // When the HMR update is fully complete after a deploy,
    // reset deployInProgress back to false.
    if (!gitData.canPush.status) {
      setDeployInProgress(false);
    }
  }, []);

  const isDisabled =
    deployInProgress || (!hasChanges && !gitData.canPush.status);

  return (
    <button
      className="ml-4 py-1 px-3 text-white rounded-md disabled:bg-gray-400 bg-blue-600 hover:bg-blue-500"
      onClick={handleClick}
      disabled={isDisabled}
      aria-label="Deploy Changes to Repository"
    >
      <span id={tooltipAnchorID}>Deploy</span>
      {isDisabled && gitData.canPush.reason && (
        <Tooltip
          className="z-20"
          anchorId={tooltipAnchorID}
          content={gitData.canPush.reason}
        />
      )}
    </button>
  );
}
