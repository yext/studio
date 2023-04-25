import { useCallback, useRef, useState, MouseEvent } from "react";
import FieldDropdown from "./FieldDropdown";
import { ReactComponent as EmbedIcon } from "../../icons/embed.svg";
import useRootClose from "@restart/ui/useRootClose";

/**
 * An icon that when clicked on, opens up a dropdown for selecting
 * entity data fields.
 */
export default function FieldPicker({
  handleFieldSelection,
  filteredEntityData,
}: {
  handleFieldSelection: (fieldId: string) => void;
  filteredEntityData: Record<string, unknown>;
}) {
  const [expandedFieldId, setExpandedFieldId] = useState<string>();
  const containerRef = useRef<HTMLDivElement>(null);

  useRootClose(containerRef, () => {
    setExpandedFieldId(undefined);
  });

  const fieldPickerIsClosed = expandedFieldId === undefined;
  const togglePicker = useCallback(
    (e: MouseEvent<SVGSVGElement>) => {
      e.preventDefault();
      if (fieldPickerIsClosed) {
        setExpandedFieldId("");
      } else {
        setExpandedFieldId(undefined);
      }
    },
    [fieldPickerIsClosed]
  );

  const handleFieldDropdownSelection = useCallback(
    (fieldId: string) => {
      handleFieldSelection(`document.${fieldId}`);
      setExpandedFieldId(undefined);
    },
    [handleFieldSelection]
  );

  const handleNestedObjectSelection = useCallback(
    (fieldId: string) => {
      if (expandedFieldId !== fieldId) {
        setExpandedFieldId(fieldId);
      } else {
        const parentFieldId = fieldId.substring(0, fieldId.lastIndexOf("."));
        setExpandedFieldId(parentFieldId);
      }
    },
    [expandedFieldId]
  );

  const isExpandedFieldId = useCallback(
    (fieldId: string) => {
      return !!expandedFieldId?.startsWith(fieldId);
    },
    [expandedFieldId]
  );

  return (
    <div ref={containerRef}>
      <EmbedIcon
        role="button"
        onClick={togglePicker}
        className="hover:opacity-100 opacity-50 cursor-pointer"
        aria-label="Toggle field picker"
      />
      {!fieldPickerIsClosed && (
        <FieldDropdown
          fieldIdToValue={filteredEntityData}
          handleFieldSelection={handleFieldDropdownSelection}
          handleNestedObjectSelection={handleNestedObjectSelection}
          isExpandedFieldId={isExpandedFieldId}
        />
      )}
    </div>
  );
}
