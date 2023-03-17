import { useCallback, MouseEvent, CSSProperties } from "react";
import { ReactComponent as VectorIcon } from "../../icons/vector.svg";

const listStyles: CSSProperties = {
  minWidth: "200px",
  right: "-1px",
};

/**
 * Dropdown for the FieldPicker.
 */
export default function FieldDropdown({
  fields,
  dataSourcePath,
  visiblePath,
  setVisiblePath,
  handleFieldSelection,
}: {
  fields: Record<string, unknown>;
  dataSourcePath: string;
  visiblePath: string;
  setVisiblePath: (visiblePath: string) => void;
  handleFieldSelection: (dataSourcePath: string) => void;
}) {
  return (
    <ul
      className="absolute w-max bg-white mt-2 rounded border"
      style={listStyles}
    >
      {Object.keys(fields).map((field) => {
        return (
          <Option
            field={field}
            fields={fields}
            key={field}
            dataSourcePath={dataSourcePath}
            visiblePath={visiblePath}
            setVisiblePath={setVisiblePath}
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
  visiblePath,
  setVisiblePath,
  handleFieldSelection,
}: {
  field: string;
  fields: Record<string, unknown>;
  dataSourcePath: string;
  visiblePath: string;
  setVisiblePath: (visiblePath: string) => void;
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
        if (visiblePath !== fieldPath) {
          setVisiblePath(fieldPath);
        } else {
          setVisiblePath(dataSourcePath);
        }
      } else {
        handleFieldSelection(fieldPath);
        setVisiblePath("");
      }
    },
    [
      dataSourcePath,
      fieldPath,
      handleFieldSelection,
      isObject,
      setVisiblePath,
      visiblePath,
    ]
  );

  return (
    <li
      className="hover:bg-gray-100 px-4 py-1 cursor-pointer flex justify-between"
      key={field}
      onClick={handleClick}
    >
      {field}
      {isObject && (
        <div className="flex items-center pr-2">
          <VectorIcon />
          {visiblePath.startsWith(fieldPath) && (
            <div className="mt-4">
              <FieldDropdown
                fields={value as Record<string, unknown>}
                dataSourcePath={fieldPath}
                visiblePath={visiblePath}
                setVisiblePath={setVisiblePath}
                handleFieldSelection={handleFieldSelection}
              />
            </div>
          )}
        </div>
      )}
    </li>
  );
}
