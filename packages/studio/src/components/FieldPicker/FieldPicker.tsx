import { useCallback, useRef, useState, MouseEvent } from "react";
import FieldDropdown from "./FieldDropdown";
import { ReactComponent as EmbedIcon } from "../../icons/embed.svg";
import useRootClose from "@restart/ui/useRootClose";
import classNames from "classnames";

/**
 * An icon that when clicked on, opens up a dropdown for selecting
 * entity data fields.
 */
export default function FieldPicker({
  handleFieldSelection,
  filteredEntityData,
  disabled,
}: {
  handleFieldSelection: (fieldId: string) => void;
  filteredEntityData: Record<string, unknown>;
  disabled?: boolean;
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
      if (disabled) {
        return;
      }
      if (fieldPickerIsClosed) {
        setExpandedFieldId("");
      } else {
        setExpandedFieldId(undefined);
      }
    },
    [fieldPickerIsClosed, disabled]
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
  const classes = classNames("opacity-50", {
    "cursor-pointer hover:opacity-100": !disabled,
    "cursor-default": disabled,
  });

  return (
    <div ref={containerRef}>
      <EmbedIcon
        role="button"
        onClick={togglePicker}
        className={classes}
        aria-label="Toggle field picker"
      />
      {!fieldPickerIsClosed && (
        <div className="absolute z-10 left-12">
          <FieldDropdown
            fieldIdToValue={filteredEntityData}
            handleFieldSelection={handleFieldDropdownSelection}
            handleNestedObjectSelection={handleNestedObjectSelection}
            isExpandedFieldId={isExpandedFieldId}
          />
        </div>
      )}
    </div>
  );
}
