import { useCallback, useMemo } from "react";
import DialogModal from "../common/DialogModal";
import { FlowStepModalProps } from "./FlowStep";
import { useStreamScope } from "./AddPageContext";
import StreamScopeInput from "../StreamScopeInput";
import { StreamScope } from "@yext/studio-plugin";

export default function StreamScopeCollector({
  isOpen,
  handleClose,
  handleConfirm,
}: FlowStepModalProps) {
  const [streamScope, setStreamScope] = useStreamScope();

  const onConfirm = useCallback(async () => {
    if (streamScope === undefined) {
      setStreamScope({});
    }
    await handleConfirm();
  }, [streamScope, setStreamScope, handleConfirm]);

  const updateSelection = useCallback(
    (streamScopeField: keyof StreamScope) => (selectedIds: string[]) => {
      if (selectedIds.length) {
        setStreamScope({
          [streamScopeField]: selectedIds,
        });
      } else {
        setStreamScope({});
      }
    },
    [setStreamScope]
  );

  const modalBodyContent = useMemo(() => {
    return (
      <>
        <div className="italic mb-4">
          Use one of the optional fields below to specify which entities this
          page can access.
        </div>
        <StreamScopeInput
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
