import { useMemo } from "react";
import useStudioStore from "../store/useStudioStore";
import { StreamScope } from "@yext/studio-plugin";
import StreamScopeField, {
  StreamScopeFieldProps,
} from "./common/StreamScopeField";
import EntityIdField from "./AddPageButton/EntityIdField";

export type updateScopeField = (selectedIds: string[]) => void;
export type updateScopeFieldFactory = (
  streamScopeField: keyof StreamScope
) => updateScopeField;

export interface StreamScopePickerProps {
  streamScope: StreamScope | undefined;
  updateSelection: updateScopeFieldFactory;
}

export default function StreamScopePicker(props: StreamScopePickerProps) {
  const { streamScope, updateSelection } = props;
  const streamScopeFields = useStreamScopeFields();
  const totalStreamScopeItems = Object.values(streamScope ?? {}).reduce(
    (numItems, scopeItems) => {
      return numItems + scopeItems.length;
    },
    0
  );

  const scopeFieldsSelections =
    streamScope &&
    Object.values(streamScope).filter((selectedIds) => selectedIds.length > 0);
  const multipleScopesSelected = (scopeFieldsSelections?.length || 0) > 1;

  const filterIdOrEntityTypeSelected = !!(
    streamScope?.entityTypes?.length || streamScope?.savedFilterIds?.length
  );

  return (
    <>
      <EntityIdField
        disabled={filterIdOrEntityTypeSelected || multipleScopesSelected}
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
            disabled={hasOtherScopeFilters || multipleScopesSelected}
          />
        );
      })}
    </>
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
