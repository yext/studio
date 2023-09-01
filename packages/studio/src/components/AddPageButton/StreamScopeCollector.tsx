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

  const scopeFormData: {
    [field in keyof StreamScope]: Pick<
      ScopeFilterFieldProps,
      "emptyText" | "allItems" | "getDisplayName"
    >;
  } = useMemo(
    () => ({
      entityIds: {
        emptyText: "No entities found in the account.",
        // TODO (SLAP-2907): Populate dropdown from store
        allItems: [],
      },
      entityTypes: {
        emptyText: "No entity types found in the account.",
        allItems: Object.keys(entitiesRecord),
      },
      savedFilterIds: {
        emptyText: "No saved filters found in the account.",
        allItems: savedFilters.map((f) => f.id),
        getDisplayName: (item) => {
          const savedFilter = savedFilters.find((f) => f.id === item);
          return savedFilter ? getDisplayString(savedFilter) : item;
        },
      },
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
        {Object.entries(scopeFormData).map(([field, data]) => {
          const selectedItems: string[] | undefined = streamScope?.[field];
          const hasOtherScopeFilters =
            totalStreamScopeItems > (selectedItems?.length ?? 0);
          return (
            <ScopeFilterField
              key={field}
              field={field}
              selectedItems={selectedItems}
              disabled={data.allItems.length > 0 && hasOtherScopeFilters}
              {...data}
            />
          );
        })}
      </>
    );
  }, [scopeFormData, streamScope]);

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

function getDisplayString({
  id,
  displayName,
}: {
  id: string;
  displayName: string;
}) {
  return `${displayName} (id: ${id})`;
}
