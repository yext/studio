import {
  ArrayPropType,
  PropMetadata,
  PropType,
  PropVal,
  PropValueKind,
  PropValueType,
  TypeGuards,
} from "@yext/studio-plugin";
import { Tooltip } from "react-tooltip";
import FieldPickerInput from "./FieldPicker/FieldPickerInput";
import { ChangeEvent, useCallback } from "react";
import { renderBranchUI } from "./PropEditor";
import { renderPropEditor } from "./PropEditors";
import { ReactComponent as Plus } from "../icons/plus.svg";
import PropValueHelpers from "../utils/PropValueHelpers";
import classNames from "classnames";

interface ArrayPropEditorProps {
  propName: string;
  propMetadata: Extract<PropMetadata, ArrayPropType>;
  propValue?: string | PropVal[];
  onPropChange: (propName: string, propVal: PropVal) => void;
  isNested?: boolean;
}

const tooltipStyle = { backgroundColor: "black" };
const DEFAULT_ARRAY_LITERAL = [];

/**
 * Renders an input editor for a single array-type prop.
 */
export default function ArrayPropEditor({
  propName,
  propMetadata,
  propValue,
  onPropChange,
  isNested,
}: ArrayPropEditorProps) {
  const value = getEditorValue(propValue);
  const isExpression = typeof value === "string";

  const fieldPickerFilter = useCallback(
    (value: unknown) => TypeGuards.valueMatchesPropType(propMetadata, value),
    [propMetadata]
  );

  const onChange = useCallback(
    (value: string | PropVal[]) =>
      onPropChange(propName, createArrayPropVal(value)),
    [onPropChange, propName]
  );

  const onExpressionChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value),
    [onChange]
  );

  const containerClasses = classNames("flex ", {
    "mb-2": !isNested
  });

  const docTooltipId = `${propName}-doc`;
  const inputTooltipId = `${propName}-input`;

  return (
    <div className={containerClasses}>
      {renderBranchUI(isNested, "pt-[.5em]")}
      <div className="flex flex-col text-sm">
        <label className="flex h-10 items-center">
          <p className="pr-2 font-semibold" id={docTooltipId}>
            {propName}
          </p>
          {propMetadata.doc && (
            <Tooltip
              style={tooltipStyle}
              anchorId={docTooltipId}
              content={propMetadata.doc}
              place="top"
            />
          )}
          <div id={inputTooltipId}>
            <FieldPickerInput
              onInputChange={onExpressionChange}
              handleFieldSelection={onChange}
              displayValue={isExpression ? value : ""}
              fieldFilter={fieldPickerFilter}
              disabled={!isExpression}
            />
          </div>
          {!isExpression && (
            <Tooltip
              style={tooltipStyle}
              anchorId={inputTooltipId}
              content="Disabled while items are present below"
              place="top"
            />
          )}
        </label>
        <LiteralEditor
          value={isExpression ? DEFAULT_ARRAY_LITERAL : value}
          itemType={propMetadata.itemType}
          updateItems={onChange}
        />
      </div>
    </div>
  );
}

function LiteralEditor({ value, itemType, updateItems }: {
  value: PropVal[],
  itemType: PropType,
  updateItems: (value: PropVal[]) => void
}) {
  const addItem = useCallback(() => updateItems([
    ...value,
    PropValueHelpers.getDefaultPropVal(itemType)
  ]), [itemType, value, updateItems]);

  const updateItem = useCallback((itemName: string, itemVal: PropVal) => {
    const index = parseInt(itemName.replace("Item ", "")) - 1;
    const newPropVals = [...value];
    newPropVals.splice(index, 1, itemVal);
    updateItems(newPropVals);
  }, [value, updateItems]);

  return (
    <>
      {value.length > 0 &&
        <div className="pt-2 ml-2 border-l-2">
          {value.map((propVal, index) => {
            const name = `Item ${index + 1}`;
            const editor = renderPropEditor(
              name,
              { ...itemType, required: false },
              propVal,
              updateItem,
              true
            );
            return <div key={name}>{editor}</div>;
          })}
        </div>
      }
      <div className="flex flex-row ml-2 self-start items-center">
        <div className="before:border-l-2 before:pt-3 pb-3"></div>
        {renderBranchUI(true)}
        <button
          className="flex gap-x-2 items-center self-start py-1 px-2 bg-gray-200
            hover:bg-gray-300 rounded-md mt-2"
          onClick={addItem}
        >
          <Plus />
          Add Item
        </button>
      </div>
    </>
  );
}

function createArrayPropVal(value: string | PropVal[]): PropVal {
  if (Array.isArray(value)) {
    return {
      kind: PropValueKind.Literal,
      valueType: PropValueType.Array,
      value,
    };
  }
  return {
    kind: PropValueKind.Expression,
    valueType: PropValueType.Array,
    value,
  };
}

function getEditorValue(propValue: string | PropVal[] | undefined) {
  if (typeof propValue === "string" || propValue?.length) {
    return propValue;
  }
  return "";
}
