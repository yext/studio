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
      {Object.keys(props.fieldIdToValue).map((subfieldId) => {
        return <Item subfieldId={subfieldId} {...props} key={subfieldId} />;
      })}
    </ul>
  );
}

function Item(props: FieldDropdownProps & { subfieldId: string }) {
  const { subfieldId, fieldIdToValue, parentFieldPath, ...callbacks } = props;

  const {
    handleNestedObjectSelection,
    handleFieldSelection,
    isExpandedFieldId,
  } = callbacks;

  const value = fieldIdToValue[subfieldId];
  const isObject =
    typeof value === "object" && !Array.isArray(value) && value !== null;
  const fieldId =
    parentFieldPath === "" ? subfieldId : `${parentFieldPath}.${subfieldId}`;

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

  const displayValue = startCase(subfieldId.split("c_").at(-1));

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
