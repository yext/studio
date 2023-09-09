import { useCallback, useMemo } from "react";
import DialogModal from "../common/DialogModal";
import { FlowStepModalProps } from "./FlowStep";
import { useStreamScope } from "./AddPageContext";
import useStudioStore from "../../store/useStudioStore";
import { StreamScope } from "@yext/studio-plugin";
import StreamScopeField, {
  StreamScopeFieldProps,
} from "../common/StreamScopeField";
import EntityIdField from "./EntityIdField";

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

  const streamScopeFields = useStreamScopeFields();

  const modalBodyContent = useMemo(() => {
    const totalStreamScopeItems = Object.values(streamScope ?? {}).reduce(
      (numItems, scopeItems) => {
        return numItems + scopeItems.length;
      },
      0
    );

    const updateSelection =
      (streamScopeField: keyof StreamScope) => (selectedIds: string[]) => {
        if (selectedIds.length) {
          setStreamScope({
            [streamScopeField]: selectedIds,
          });
        } else {
          setStreamScope({});
        }
      };

    return (
      <>
        <div className="italic mb-4">
          Use one of the optional fields below to specify which entities this
          page can access.
        </div>
        <EntityIdField
          disabled={
            !!streamScope?.entityTypes?.length ||
            !!streamScope?.savedFilterIds?.length
          }
          updateSelection={updateSelection("entityIds")}
          selectedIds={streamScope?.entityIds}
        />
        {streamScopeFields.map(([streamScopeField, options]) => {
          const selectedIds: string[] | undefined =
            streamScope?.[streamScopeField];
          const hasOtherScopeFilters =
            totalStreamScopeItems > (selectedIds?.length ?? 0);
          return (
            <StreamScopeField
              key={streamScopeField}
              streamScopeField={streamScopeField}
              options={options}
              selectedIds={selectedIds}
              updateSelection={updateSelection(streamScopeField)}
              disabled={hasOtherScopeFilters}
            />
          );
        })}
      </>
    );
  }, [streamScopeFields, streamScope, setStreamScope]);

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

function useStreamScopeFields() {
  const [savedFilters, entitiesRecord] = useStudioStore((store) => [
    store.accountContent.savedFilters,
    store.accountContent.entitiesRecord,
  ]);

  return useMemo(() => {
    return [
      [
        "entityTypes",
        Object.keys(entitiesRecord).map((entityType) => ({ id: entityType })),
      ],
      ["savedFilterIds", savedFilters],
    ] satisfies [keyof StreamScope, StreamScopeFieldProps["options"]][];
  }, [entitiesRecord, savedFilters]);
}
