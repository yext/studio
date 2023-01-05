import { useCallback, useEffect, useMemo, useState } from "react"
import useStudioStore from "../store/useStudioStore"
import { MessageID } from "@yext/studio-plugin"
import useMessageListener from "../hooks/useMessageListener"
import classNames from "classnames"

/**
 * Renders a button for committing changes to user's files.
 */
export default function CommitChangesButton() {
  const { pagesToRemove, pagesToUpdate } = useStudioStore(store => store.pages.pendingChanges)
  const [isButtonDisabled, setIsButtonDisabled] = useState(false)
  const commitChangesAction = useStudioStore(store => store.commitChanges)

  useEffect(() => {
    setIsButtonDisabled(pagesToRemove.size === 0 && pagesToUpdate.size === 0);
  }, [pagesToRemove.size, pagesToUpdate.size])


  const listenerCallback = useCallback(() => {
    setIsButtonDisabled(false)
  }, [])
  useMessageListener(MessageID.StudioCommitChanges, listenerCallback)

  const handleClickSave = useCallback(() => {
    commitChangesAction()
    setIsButtonDisabled(true)
  }, [commitChangesAction])

  const buttonClasses = useMemo(() => classNames(
    "ml-4 py-1 px-3 text-white rounded-md",
    {
      "bg-gray-400": isButtonDisabled,
      "bg-blue-600": !isButtonDisabled,
    }
  ), [isButtonDisabled])

  return <button
    className={buttonClasses}
    onClick={handleClickSave}
    disabled={isButtonDisabled}
  >Save</button>
}