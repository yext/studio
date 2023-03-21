/* eslint-disable react-perf/jsx-no-new-function-as-prop */
import { useCallback, useRef, useState, MouseEvent, useMemo } from "react";
import FieldDropdown, { FieldDropdownContext } from "./FieldDropdown";
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

  const closePicker = useCallback(() => {
    setVisiblyExpandedPath("");
  }, []);

  useRootClose(containerRef, () => {
    closePicker();
  });

  const togglePicker = useCallback(
    (e: MouseEvent<SVGSVGElement>) => {
      e.preventDefault();
      const fieldPickerIsClosed = visiblyExpandedPath === "";
      if (fieldPickerIsClosed) {
        setVisiblyExpandedPath("document");
      } else {
        closePicker();
      }
    },
    [visiblyExpandedPath, closePicker]
  );

  const filteredDocument = filterStreamDocument(fieldType, streamDocument);

  const handleFieldDropdownSelection = (fieldId: string) => {
    handleFieldSelection(fieldId);
    closePicker();
  };

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
          expandedPath={visiblyExpandedPath}
          parentPath="document"
          handleFieldSelection={handleFieldDropdownSelection}
          handleClickNestedField={(fieldId) => {
            if (visiblyExpandedPath !== fieldId) {
              setVisiblyExpandedPath(fieldId);
            } else {
              const parentPath = fieldId.substring(0, fieldId.lastIndexOf("."));
              setVisiblyExpandedPath(parentPath);
            }
          }}
        />
      )}
    </div>
  );
}
