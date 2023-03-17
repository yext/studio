import { useCallback, useRef, useState, MouseEvent } from "react";
import FieldDropdown from "./FieldDropdown";
import { ReactComponent as EmbedIcon } from "../../icons/embed.svg";
import { useRootClose } from "@restart/ui";

/**
 * An icon that when clicked on, opens up a dropdown for selecting
 * stream document fields.
 */
export default function FieldPicker({
  handleFieldSelection,
  streamDocument = {},
}: {
  handleFieldSelection: (field: string) => void;
  streamDocument?: Record<string, unknown>;
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

  const filteredDocument = filterStreamDocument(streamDocument);

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

function filterStreamDocument(streamDocument: Record<string, unknown> = {}) {
  for (const field of Object.keys(streamDocument)) {
    const value = streamDocument[field];
    if (field === "__") {
      delete streamDocument[field];
    } else if (
      typeof value === "object" &&
      !Array.isArray(value) &&
      value !== null
    ) {
      const filteredValue = filterStreamDocument(
        value as Record<string, unknown>
      );
      if (Object.keys(filteredValue).length === 0) {
        delete streamDocument[field];
      } else {
        streamDocument[field] = filteredValue;
      }
    } else if (typeof value !== "string") {
      delete streamDocument[field];
    }
  }
  return streamDocument;
}
