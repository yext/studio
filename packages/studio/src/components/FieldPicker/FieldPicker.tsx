import { useCallback, useRef, useState, MouseEvent } from "react";
import FieldDropdown from "./FieldDropdown";
import { ReactComponent as EmbedIcon } from "../../icons/embed.svg";
import { useRootClose } from "@restart/ui";
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
  handleFieldSelection: (field: string) => void;
  streamDocument?: Record<string, unknown>;
  fieldType: "string" | "array";
}) {
  const [visiblePath, setVisiblePath] = useState<string>("");
  const containerRef = useRef<HTMLDivElement>(null);

  useRootClose(containerRef, () => {
    setVisiblePath("");
  });

  const handleClick = useCallback(
    (e: MouseEvent<SVGSVGElement>) => {
      e.preventDefault();
      if (visiblePath === "") {
        setVisiblePath("document");
      } else {
        setVisiblePath("");
      }
    },
    [visiblePath]
  );

  const filteredDocument = filterStreamDocument(fieldType, streamDocument);

  return (
    <div ref={containerRef}>
      <EmbedIcon
        role="button"
        onClick={handleClick}
        className="hover:opacity-100 opacity-50 cursor-pointer"
        aria-label="Toggle field picker"
      />
      {visiblePath && streamDocument && (
        <FieldDropdown
          fields={filteredDocument}
          visiblePath={visiblePath}
          dataSourcePath="document"
          handleFieldSelection={handleFieldSelection}
          setVisiblePath={setVisiblePath}
        />
      )}
    </div>
  );
}
