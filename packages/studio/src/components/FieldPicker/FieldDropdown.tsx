import { useCallback, MouseEvent, CSSProperties } from "react";
import { ReactComponent as VectorIcon } from "../../icons/vector.svg";

const listStyles: CSSProperties = {
  minWidth: "200px",
  right: "1em",
};

interface FieldDropdownProps {
  fields: Record<string, unknown>;
  dataSourcePath: string;
  expandedPath: string;
  setExpandedPath: (expandedPath: string) => void;
  handleFieldSelection: (dataSourcePath: string) => void;
}

/**
 * Dropdown for the FieldPicker.
 */
export default function FieldDropdown({
  fields,
  dataSourcePath,
  expandedPath,
  setExpandedPath,
  handleFieldSelection,
}: FieldDropdownProps) {
  return (
    <ul
      className="absolute w-max bg-white mt-2 rounded border z-10 shadow-2xl"
      style={listStyles}
    >
      {Object.keys(fields).map((field) => {
        return (
          <Option
            field={field}
            fields={fields}
            key={field}
            dataSourcePath={dataSourcePath}
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
  field,
  fields,
  dataSourcePath,
  expandedPath,
  setExpandedPath,
  handleFieldSelection,
}: {
  field: string;
  fields: Record<string, unknown>;
  dataSourcePath: string;
  expandedPath: string;
  setExpandedPath: (expandedPath: string) => void;
  handleFieldSelection: (dataSourcePath: string) => void;
}) {
  const value = fields[field];
  const fieldPath = dataSourcePath ? dataSourcePath + `.${field}` : field;

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
          setExpandedPath(dataSourcePath);
        }
      } else {
        handleFieldSelection(fieldPath);
        setExpandedPath("");
      }
    },
    [
      dataSourcePath,
      fieldPath,
      handleFieldSelection,
      isObject,
      setExpandedPath,
      expandedPath,
    ]
  );

  return (
    <li
      className="hover:bg-gray-100 px-4 py-1 cursor-pointer flex justify-between"
      onClick={handleClick}
    >
      {field}
      {isObject && (
        <div className="flex items-center pr-2">
          <VectorIcon />
          {expandedPath.startsWith(fieldPath) && (
            <div className="mt-4">
              <FieldDropdown
                fields={value as Record<string, unknown>}
                dataSourcePath={fieldPath}
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
