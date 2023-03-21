import { useCallback, useRef, useState, MouseEvent } from "react";
import FieldDropdown from "./FieldDropdown";
import { ReactComponent as EmbedIcon } from "../../icons/embed.svg";
import useRootClose from "@restart/ui/useRootClose";
import filterStreamDocument from "../../utils/filterStreamDocument";

/**
 * An icon that when clicked on, opens up a dropdown for selecting
 * stream document fields.
 */
export default function FieldPicker({
  handleFieldSelection,
  streamDocument = {},
  fieldType = "string",
}: {
  handleFieldSelection: (fieldId: string) => void;
  streamDocument?: Record<string, unknown>;
  fieldType: "string" | "array";
}) {
  const [visiblyExpandedPath, setVisiblyExpandedPath] = useState<string>("");
  const containerRef = useRef<HTMLDivElement>(null);

  useRootClose(containerRef, () => {
    setVisiblyExpandedPath("");
  });

  const togglePicker = useCallback(
    (e: MouseEvent<SVGSVGElement>) => {
      e.preventDefault();
      const fieldPickerIsClosed = visiblyExpandedPath === "";
      if (fieldPickerIsClosed) {
        setVisiblyExpandedPath("document");
      } else {
        setVisiblyExpandedPath("");
      }
    },
    [visiblyExpandedPath]
  );

  const filteredDocument = filterStreamDocument(fieldType, streamDocument);

  const handleFieldDropdownSelection = useCallback(
    (fieldId: string) => {
      handleFieldSelection(fieldId);
      setVisiblyExpandedPath("");
    },
    [handleFieldSelection]
  );

  const handleNestedObjectSelection = useCallback(
    (fieldId) => {
      if (visiblyExpandedPath !== fieldId) {
        setVisiblyExpandedPath(fieldId);
      } else {
        const parentPath = fieldId.substring(0, fieldId.lastIndexOf("."));
        setVisiblyExpandedPath(parentPath);
      }
    },
    [visiblyExpandedPath]
  );

  const isExpandedFieldId = useCallback(
    (fieldId: string) => {
      return visiblyExpandedPath.startsWith(fieldId);
    },
    [visiblyExpandedPath]
  );

  return (
    <div ref={containerRef}>
      <EmbedIcon
        role="button"
        onClick={togglePicker}
        className="hover:opacity-100 opacity-50 cursor-pointer"
        aria-label="Toggle field picker"
      />
      {visiblyExpandedPath && streamDocument && (
        <FieldDropdown
          fieldIdToValue={filteredDocument}
          parentPath="document"
          handleFieldSelection={handleFieldDropdownSelection}
          handleNestedObjectSelection={handleNestedObjectSelection}
          isExpandedFieldId={isExpandedFieldId}
        />
      )}
    </div>
  );
}
