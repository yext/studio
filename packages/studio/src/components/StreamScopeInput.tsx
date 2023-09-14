import { useMemo } from "react";
import useStudioStore from "../store/useStudioStore";
import { StreamScope } from "@yext/studio-plugin";
import StreamScopeField, {
  StreamScopeFieldProps,
} from "./common/StreamScopeField";
import EntityIdField from "./AddPageButton/EntityIdField";

export interface StreamScopeInputProps {
  streamScope: StreamScope | undefined;
  updateSelection: (
    streamScopeField: keyof StreamScope
  ) => (selectedIds: string[]) => void;
  disabled?: boolean;
}

export default function StreamScopeInput(props: StreamScopeInputProps) {
  const { streamScope, updateSelection, disabled } = props;
  const streamScopeFields = useStreamScopeFields();
  const totalStreamScopeItems = Object.values(streamScope ?? {}).reduce(
    (numItems, scopeItems) => {
      return numItems + scopeItems.length;
    },
    0
  );

  if (disabled) {
    return (
      <>
        <EntityIdField
          disabled={true}
          updateSelection={updateSelection("entityIds")}
          selectedIds={streamScope?.entityIds}
        />
        {streamScopeFields.map(([streamScopeField, options]) => {
          const selectedIds: string[] | undefined =
            streamScope?.[streamScopeField];
          return (
            <StreamScopeField
              key={streamScopeField}
              streamScopeField={streamScopeField}
              options={options}
              selectedIds={selectedIds}
              updateSelection={updateSelection(streamScopeField)}
              disabled={true}
            />
          );
        })}
      </>
    );
  }

  return (
    <>
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