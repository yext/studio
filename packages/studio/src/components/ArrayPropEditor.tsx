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
import { ChangeEvent, useCallback, useMemo } from "react";
import { renderBranchUI } from "./PropEditor";
import { renderPropEditor } from "./PropEditors";
import { ReactComponent as Plus } from "../icons/plus.svg";
import PropValueHelpers from "../utils/PropValueHelpers";
import classNames from "classnames";
import RemovableElement from "./RemovableElement";
import { v4 } from "uuid";

interface ArrayPropEditorProps {
  propName: string;
  propMetadata: Extract<PropMetadata, ArrayPropType>;
  propValue?: string | PropVal[];
  onPropChange: (propVal: PropVal) => void;
  isNested?: boolean;
}

const DEFAULT_ARRAY_LITERAL = [];
const tooltipStyle = { backgroundColor: "black" };

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
  const uniqueId = useMemo(() => v4(), []);

  const fieldPickerFilter = useCallback(
    (value: unknown) => TypeGuards.valueMatchesPropType(propMetadata, value),
    [propMetadata]
  );

  const onChange = useCallback(
    (value: string | PropVal[]) => onPropChange(createArrayPropVal(value)),
    [onPropChange]
  );

  const onExpressionChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value),
    [onChange]
  );

  const containerClasses = classNames("flex text-sm", {
    "mb-2": !isNested,
  });

  const propTooltipId = `${uniqueId}-prop-tooltip`;
  const inputTooltipId = `${uniqueId}-input-tooltip`;
  const isUndefinedValue = propValue === undefined;

  return (
    <div className={containerClasses}>
      {isNested && renderBranchUI()}
      <div className="flex flex-col">
        <label className="flex-col items-center">
          <p className="pr-2 pb-1 font-semibold" id={propTooltipId}>
            {propName}
          </p>
          {propMetadata.tooltip && (
            <Tooltip
              style={tooltipStyle}
              anchorId={propTooltipId}
              content={propMetadata.tooltip}
              place="left"
            />
          )}
          <div id={inputTooltipId}>
            <FieldPickerInput
              onInputChange={onExpressionChange}
              handleFieldSelection={onChange}
              displayValue={isExpression ? value : ""}
              fieldFilter={fieldPickerFilter}
              disabled={!isExpression || isUndefinedValue}
            />
          </div>
          {!isExpression && (
            <Tooltip
              style={tooltipStyle}
              anchorId={inputTooltipId}
              content="Disabled while items are present below"
              place="left"
            />
          )}
        </label>
        {!isUndefinedValue && (
          <LiteralEditor
            value={isExpression ? DEFAULT_ARRAY_LITERAL : value}
            itemType={propMetadata.itemType}
            updateItems={onChange}
          />
        )}
      </div>
    </div>
  );
}

function LiteralEditor({
  value,
  itemType,
  updateItems,
}: {
  value: PropVal[];
  itemType: PropType;
  updateItems: (value: PropVal[]) => void;
}) {
  const propValues = Object.fromEntries(
    value.map((propVal, index) => [`Item ${index + 1}`, propVal])
  );

  const updateItem = useCallback(
    (itemName: string) => (itemVal: PropVal) =>
      updateItems(Object.values({ ...propValues, [itemName]: itemVal })),
    [propValues, updateItems]
  );

  const addItem = useCallback(
    () => updateItems([...value, PropValueHelpers.getDefaultPropVal(itemType)]),
    [itemType, value, updateItems]
  );

  const generateRemoveItem = useCallback(
    (index: number) => () => {
      const updatedItems = [...value];
      updatedItems.splice(index, 1);
      updateItems(updatedItems);
    },
    [value, updateItems]
  );

  const buttonClasses = classNames("ml-3", {
    "self-start mt-2": itemType.type === PropValueType.Object,
    "mt-2": itemType.type !== PropValueType.Object,
  });

  return (
    <>
      {value.length > 0 && (
        <div className="pt-2 ml-2 border-l-2">
          {Object.entries(propValues).map(([name, propVal], index) => {
            const editor = renderPropEditor(
              name,
              { ...itemType, required: false },
              propVal,
              updateItem(name),
              true
            );
            return (
              <RemovableElement
                key={name}
                onRemove={generateRemoveItem(index)}
                buttonClasses={buttonClasses}
                ariaLabel={`Remove ${name}`}
              >
                {editor}
              </RemovableElement>
            );
          })}
        </div>
      )}
      <div className="flex items-center ml-2 mt-1">
        <div className="before:border-l-2 before:pt-3 pb-4"></div>
        {renderBranchUI()}
        <button
          className="flex gap-x-2 items-center bg-gray-200 hover:bg-gray-300
            rounded-md py-1 px-2"
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
