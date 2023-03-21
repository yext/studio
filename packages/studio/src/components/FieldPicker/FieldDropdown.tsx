/* eslint-disable react-perf/jsx-no-new-function-as-prop */
import {
  useCallback,
  MouseEvent,
  CSSProperties,
  createContext,
  useContext,
  MouseEventHandler,
  PropsWithChildren,
} from "react";
import { ReactComponent as VectorIcon } from "../../icons/vector.svg";
import { startCase } from "lodash";

const listStyles: CSSProperties = {
  minWidth: "200px",
  right: "1em",
};

interface FieldDropdownProps {
  fieldIdToValue: Record<string, unknown>;
  parentPath: string;
  expandedPath: string;
  handleClickNestedField: (fieldId: string) => void;
  handleFieldSelection: (fieldId: string) => void;
}

/**
 * FieldDropdown renders a dropdown for picking stream document fields.
 * When an object field is encountered, FieldDropdown will open a child
 * FieldDropdown for rendering the object field.
 */
export default function FieldDropdown({
  fieldIdToValue,
  parentPath,
  expandedPath,
  handleClickNestedField,
  handleFieldSelection,
}: FieldDropdownProps) {
  return (
    <ul
      className="absolute w-max bg-white mt-2 rounded border z-10 shadow-2xl"
      style={listStyles}
    >
      {Object.entries(fieldIdToValue).map(([currentFieldId, value]) => {
        return (
          <Item>
          </Item>
        );
      })}
    </ul>
  );
}

function Item(props: {

}>) {

  const isObject =
    typeof value === "object" && !Array.isArray(value) && value !== null;
  const displayValue = startCase(currentFieldId.split("c_").at(-1));
  const fullFieldId = parentPath
    ? `${parentPath}.${currentFieldId}`
    : currentFieldId;
  const isExpanded = expandedPath.startsWith(fullFieldId);
  const handleClick = useCallback((e: MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (isObject) {
      handleClickNestedField(fullFieldId);
    } else {
      handleFieldSelection(fullFieldId);
    }
  }, [])
  return (
    <li
      className="hover:bg-gray-100 px-4 py-1 cursor-pointer flex justify-between"
      onClick={handleClick}
    >

      {displayValue}
      {isExpanded && (
        <div className="flex items-center pr-2">
          <VectorIcon />
          {isExpanded && (
            <div className="mt-4">
              <FieldDropdown
                fieldIdToValue={value as Record<string, unknown>}
                parentPath={fullFieldId}
                expandedPath={expandedPath}
                handleClickNestedField={handleClickNestedField}
                handleFieldSelection={handleFieldSelection}
              />
            </div>
          )}
        </div>
      )}
    </li>
  );
}
