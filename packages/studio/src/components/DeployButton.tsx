import useStudioStore from "../store/useStudioStore";
import { useCallback, useEffect, useState } from "react";
import gitData from "virtual_yext-studio-git-data";
import useHasChanges from "../hooks/useHasChanges";
import { Tooltip } from "react-tooltip";

const tooltipAnchorID = "YextStudio-deployButton";

/**
 * Renders a button for saving, committing, and pushing changes.
 */
export default function DeployButton() {
  const deploy = useStudioStore((store) => store.actions.deploy);
  const [deployInProgress, setDeployInProgress] = useState(false);
  const hasChanges = useHasChanges();

  const handleClick = useCallback(() => {
    setDeployInProgress(true);
    void deploy();
  }, [deploy, setDeployInProgress]);

  useEffect(() => {
    // When the HMR update is fully complete after a deploy,
    // reset deployInProgress back to false.
    // Setting it back to false immediately after awaiting the deploy action
    // can lead to an intermediate state when deployInProgress is false
    // but the HMR update hasn't completed yet, resulting in a momentary flicker.
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
