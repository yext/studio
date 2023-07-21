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
import RemovableElement from "./RemovableElement";

interface ArrayPropEditorProps {
  propName: string;
  propMetadata: Extract<PropMetadata, ArrayPropType>;
  propValue?: string | PropVal[];
  onPropChange: (propVal: PropVal) => void;
  containers: string[];
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
  containers,
  isNested,
}: ArrayPropEditorProps) {
  const value = getEditorValue(propValue);
  const isExpression = typeof value === "string";

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

  const docTooltipId = `[${containers}]-${propName}-doc`;
  const inputTooltipId = `[${containers}]-${propName}-input`;
  const isUndefinedValue = propValue === undefined;

  return (
    <div className={containerClasses}>
      {renderBranchUI(isNested, "pt-2")}
      <div className="flex flex-col">
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
              disabled={!isExpression || isUndefinedValue}
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
        {!isUndefinedValue && (
          <LiteralEditor
            value={isExpression ? DEFAULT_ARRAY_LITERAL : value}
            itemType={propMetadata.itemType}
            updateItems={onChange}
            containers={containers.concat(propName)}
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
  containers,
}: {
  value: PropVal[];
  itemType: PropType;
  updateItems: (value: PropVal[]) => void;
  containers: string[];
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
    "mb-2": itemType.type !== PropValueType.Object,
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
              containers.concat(name),
              true,
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
        {renderBranchUI(true)}
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
