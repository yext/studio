import { useCallback, MouseEvent, CSSProperties } from "react";
import { ReactComponent as VectorIcon } from "../../icons/vector.svg";
import { startCase } from "lodash";

const listStyles: CSSProperties = {
  minWidth: "200px",
  right: "1em",
};

interface FieldDropdownProps {
  fieldIdToValue: Record<string, unknown>;
  parentFieldPath: string;
  handleNestedObjectSelection: (fieldId: string) => void;
  handleFieldSelection: (fieldId: string) => void;
  isExpandedFieldId: (fieldId: string) => boolean;
}

/**
 * FieldDropdown renders a dropdown for picking stream document fields.
 * When an object field is encountered, FieldDropdown will open a child
 * FieldDropdown for rendering the object field.
 */
export default function FieldDropdown(props: FieldDropdownProps) {
  return (
    <ul
      className="absolute w-max bg-white mt-2 rounded border z-10 shadow-2xl"
      style={listStyles}
    >
      {Object.keys(props.fieldIdToValue).map((currentFieldId) => {
        return (
          <Item
            currentFieldId={currentFieldId}
            {...props}
            key={currentFieldId}
          />
        );
      })}
    </ul>
  );
}

function Item(props: FieldDropdownProps & { currentFieldId: string }) {
  const { currentFieldId, fieldIdToValue, parentFieldPath, ...callbacks } =
    props;

  const {
    handleNestedObjectSelection,
    handleFieldSelection,
    isExpandedFieldId,
  } = callbacks;

  const value = fieldIdToValue[currentFieldId];
  const isObject =
    typeof value === "object" && !Array.isArray(value) && value !== null;
  const fieldId =
    parentFieldPath === ""
      ? `${parentFieldPath}.${currentFieldId}`
      : currentFieldId;

  const handleClick = useCallback(
    (e: MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      if (isObject) {
        handleNestedObjectSelection(fieldId);
      } else {
        handleFieldSelection(fieldId);
      }
    },
    [fieldId, handleNestedObjectSelection, handleFieldSelection, isObject]
  );

  const displayValue = startCase(currentFieldId.split("c_").at(-1));

  return (
    <li
      className="hover:bg-gray-100 px-4 py-1 cursor-pointer flex justify-between"
      onClick={handleClick}
    >
      {displayValue}
      {isObject && (
        <div className="flex items-center">
          <VectorIcon />
          {isExpandedFieldId(fieldId) && (
            <div className="mt-4">
              <FieldDropdown
                fieldIdToValue={value as Record<string, unknown>}
                parentFieldPath={fieldId}
                {...callbacks}
              />
            </div>
          )}
        </div>
      )}
    </li>
  );
}
