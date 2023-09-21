import { useCallback, useMemo, useContext } from "react";
import DialogModal from "../common/DialogModal";
import { FlowStepModalProps } from "./FlowStep";
import AddPageContext from "./AddPageContext";
import StreamScopePicker, {
  updateScopeFieldFactory,
} from "../StreamScopePicker";
import { StreamScope } from "@yext/studio-plugin";

export default function StreamScopeCollector({
  isOpen,
  handleClose,
  handleConfirm,
}: FlowStepModalProps) {
  const { state, actions } = useContext(AddPageContext);
  const { streamScope } = state
  const { updateState } = actions

  const onConfirm = useCallback(async () => {
    updateState({streamScope});
    await handleConfirm();
  }, [updateState, handleConfirm, streamScope]);

  const updateSelection: updateScopeFieldFactory = useCallback(
    (streamScopeField: keyof StreamScope) => (selectedIds: string[]) => {
      if (selectedIds.length) {
        updateState({
          streamScope: {
          [streamScopeField]: selectedIds,
          }
        });
      } else {
        updateState({streamScope: {}});
      }
    },
    [updateState]
  );

  const modalBodyContent = useMemo(() => {
    return (
      <>
        <div className="italic mb-4">
          Use one of the optional fields below to specify which entities this
          page can access.
        </div>
        <StreamScopePicker
          streamScope={streamScope}
          updateSelection={updateSelection}
        />
      </>
    );
  }, [streamScope, updateSelection]);

  return (
    <DialogModal
      isOpen={isOpen}
      title="Content Scope"
      handleClose={handleClose}
      handleConfirm={onConfirm}
      body={modalBodyContent}
      confirmButtonText="Next"
      isConfirmButtonDisabled={false}
    />
  );
}
