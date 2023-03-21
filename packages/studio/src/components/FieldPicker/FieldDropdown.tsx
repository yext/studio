import { useCallback, MouseEvent, CSSProperties } from "react";
import { ReactComponent as VectorIcon } from "../../icons/vector.svg";
import { startCase } from "lodash";

const listStyles: CSSProperties = {
  minWidth: "200px",
  right: "1em",
};

interface FieldDropdownProps {
  fieldIdToValue: Record<string, unknown>;
  dataSourcePath: string;
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
      {Object.keys(fieldIdToValue).map((fieldId) => {
        return (
          <Option
            fieldId={fieldId}
            fields={fieldIdToValue}
            key={fieldId}
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
  fieldId,
  fields,
  dataSourcePath,
  expandedPath,
  setExpandedPath,
  handleFieldSelection,
}: {
  fieldId: string;
  fields: Record<string, unknown>;
  dataSourcePath: string;
  expandedPath: string;
  setExpandedPath: (expandedPath: string) => void;
  handleFieldSelection: (dataSourcePath: string) => void;
}) {
  const value = fields[fieldId];
  const fieldPath = dataSourcePath ? dataSourcePath + `.${fieldId}` : fieldId;

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
