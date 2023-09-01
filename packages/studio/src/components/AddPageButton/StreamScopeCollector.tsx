import { useCallback, useContext, useMemo } from "react";
import DialogModal from "../common/DialogModal";
import { FlowStepModalProps } from "./FlowStep";
import AddPageContext from "./AddPageContext";
import useStudioStore from "../../store/useStudioStore";
import { StreamScope } from "@yext/studio-plugin";
import ScopeFilterField, {
  ScopeFilterFieldProps,
} from "../common/ScopeFilterField";

export default function StreamScopeCollector({
  isOpen,
  handleClose,
  handleConfirm,
}: FlowStepModalProps) {
  const { state, actions } = useContext(AddPageContext);
  const { streamScope } = state;
  const { setStreamScope } = actions;
  const [savedFilters, entitiesRecord] = useStudioStore((store) => [
    store.accountContent.savedFilters,
    store.accountContent.entitiesRecord,
  ]);

  const onConfirm = useCallback(async () => {
    if (streamScope === undefined) {
      setStreamScope({});
    }
    await handleConfirm();
  }, [streamScope, setStreamScope, handleConfirm]);

  const updateStreamScope = useCallback(
    (field: string) => (selectedIds: string[]) => {
      const updatedStreamScope = {
        ...(selectedIds.length && { [field]: selectedIds }),
      };
      setStreamScope(updatedStreamScope);
    },
    [setStreamScope]
  );

  const itemsMap: {
    [field in keyof StreamScope]: ScopeFilterFieldProps["allItems"];
  } = useMemo(
    () => ({
      // TODO (SLAP-2907): Populate dropdown from store
      entityIds: [],
      entityTypes: Object.keys(entitiesRecord).map((id) => ({ id })),
      savedFilterIds: savedFilters,
    }),
    [savedFilters, entitiesRecord]
  );

  const modalBodyContent = useMemo(() => {
    const totalStreamScopeItems = Object.values(streamScope ?? {}).reduce(
      (numItems, scopeItems) => {
        return numItems + scopeItems.length;
      },
      0
    );

    return (
      <>
        <div className="italic mb-4">
          Use one of the optional fields below to specify which entities this
          page can access.
        </div>
        {Object.entries(itemsMap).map(([field, allItems]) => {
          const selectedIds: string[] | undefined = streamScope?.[field];
          const hasOtherScopeFilters =
            totalStreamScopeItems > (selectedIds?.length ?? 0);
          return (
            <ScopeFilterField
              key={field}
              field={field}
              allItems={allItems}
              selectedIds={selectedIds}
              updateFilterFieldIds={updateStreamScope(field)}
              disabled={allItems.length > 0 && hasOtherScopeFilters}
            />
          );
        })}
      </>
    );
  }, [itemsMap, streamScope, updateStreamScope]);

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
