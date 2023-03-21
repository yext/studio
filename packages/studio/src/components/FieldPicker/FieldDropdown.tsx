import { useCallback, MouseEvent, CSSProperties } from "react";
import { ReactComponent as VectorIcon } from "../../icons/vector.svg";
import { startCase } from "lodash";

const listStyles: CSSProperties = {
  minWidth: "200px",
  right: "1em",
};

interface FieldDropdownProps {
  fieldIdToValue: Record<string, unknown>;
  prefix: string;
  expandedPath: string;
  setExpandedPath: (expandedPath: string) => void;
  handleFieldSelection: (dataSourcePath: string) => void;
}

/**
 * FieldDropdown renders a dropdown for picking stream document fields.
 * When an object field is encountered, FieldDropdown will open a child
 * FieldDropdown for rendering the object field.
 */
export default function FieldDropdown({
  fieldIdToValue,
  prefix,
  expandedPath,
  setExpandedPath,
  handleFieldSelection,
}: FieldDropdownProps) {
  return (
    <ul
      className="absolute w-max bg-white mt-2 rounded border z-10 shadow-2xl"
      style={listStyles}
    >
      {Object.keys(fieldIdToValue).map((fieldId) => {
        return (
          <Option
            fieldId={fieldId}
            fieldIdToValue={fieldIdToValue}
            key={fieldId}
            prefix={prefix}
            expandedPath={expandedPath}
            setExpandedPath={setExpandedPath}
            handleFieldSelection={handleFieldSelection}
          />
        );
      })}
    </ul>
  );
}

function Option({
  fieldId,
  fieldIdToValue,
  prefix,
  expandedPath,
  setExpandedPath,
  handleFieldSelection,
}: {
  fieldId: string;
  fieldIdToValue: Record<string, unknown>;
  prefix: string;
  expandedPath: string;
  setExpandedPath: (expandedPath: string) => void;
  handleFieldSelection: (dataSourcePath: string) => void;
}) {
  const value = fieldIdToValue[fieldId];
  const fieldPath = prefix ? prefix + `.${fieldId}` : fieldId;

  const isObject =
    typeof value === "object" && !Array.isArray(value) && value !== null;

  const handleClick = useCallback(
    (e: MouseEvent<HTMLLIElement>) => {
      e.stopPropagation();
      e.preventDefault();
      if (isObject) {
        if (expandedPath !== fieldPath) {
          setExpandedPath(fieldPath);
        } else {
          setExpandedPath(prefix);
        }
      } else {
        handleFieldSelection(fieldPath);
        setExpandedPath("");
      }
    },
    [
      isObject,
      expandedPath,
      fieldPath,
      setExpandedPath,
      prefix,
      handleFieldSelection,
    ]
  );

  const fieldDisplayValue = startCase(fieldId.split("c_").at(-1));

  return (
    <li
      className="hover:bg-gray-100 px-4 py-1 cursor-pointer flex justify-between"
      onClick={handleClick}
    >
      {fieldDisplayValue}
      {isObject && (
        <div className="flex items-center pr-2">
          <VectorIcon />
          {expandedPath.startsWith(fieldPath) && (
            <div className="mt-4">
              <FieldDropdown
                fieldIdToValue={value as Record<string, unknown>}
                prefix={fieldPath}
                expandedPath={expandedPath}
                setExpandedPath={setExpandedPath}
                handleFieldSelection={handleFieldSelection}
              />
            </div>
          )}
        </div>
      )}
    </li>
  );
}
