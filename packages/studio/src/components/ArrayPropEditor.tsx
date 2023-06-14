import {
  ArrayPropType,
  PropMetadata,
  PropType,
  PropVal,
  PropValueKind,
  PropValueType,
  PropValues,
  TypeGuards,
} from "@yext/studio-plugin";
import { Tooltip } from "react-tooltip";
import FieldPickerInput from "./FieldPicker/FieldPickerInput";
import { ChangeEvent, useCallback } from "react";
import { renderBranchUI } from "./PropEditor";
import PropEditors from "./PropEditors";
import classNames from "classnames";

interface ArrayPropEditorProps {
  propName: string;
  propMetadata: Extract<PropMetadata, ArrayPropType>;
  propValue?: string | PropVal[];
  onPropChange: (propName: string, propVal: PropVal) => void;
  isNested?: boolean;
}

const tooltipStyle = { backgroundColor: "black" };

/**
 * Renders an input editor for a single prop of a component or module.
 */
export default function ArrayPropEditor({
  propName,
  propMetadata,
  propValue,
  onPropChange,
  isNested,
}: ArrayPropEditorProps) {
  const value = Array.isArray(propValue)
    ? propValue.length > 0
      ? propValue
      : ""
    : propValue ?? "";

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

  const onLiteralChange = useCallback(
    (updatedPropValues: PropValues) =>
      onChange(Object.values(updatedPropValues)),
    [onChange]
  );

  const propNameClasses = classNames("pr-2", {
    "font-semibold": !isExpression,
  });

  const docTooltipId = `${propName}-doc`;
  const inputTooltipId = `${propName}-input`;

  return (
    <>
      <div className="flex items-center mb-2 text-sm">
        {renderBranchUI(isNested)}
        <label className="flex h-10 items-center justify-self-start">
          <p className={propNameClasses} id={docTooltipId}>
            {propName}
          </p>
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
        {propMetadata.doc && (
          <Tooltip
            style={tooltipStyle}
            anchorId={docTooltipId}
            content={propMetadata.doc}
            place="top"
          />
        )}
      </div>
      {!isExpression &&
        renderLiteralEditor(value, propMetadata.itemType, onLiteralChange)}
    </>
  );
}

function renderLiteralEditor(
  value: PropVal[],
  itemType: PropType,
  updateItems: (updatedPropValues: PropValues) => void
) {
  const propShape = Object.fromEntries(
    value.map((_, index) => [
      `Item ${index + 1}`,
      { ...itemType, required: true },
    ])
  );
  const propValues = Object.fromEntries(
    value.map((propVal, index) => [`Item ${index + 1}`, propVal])
  );

  return (
    <PropEditors
      propShape={propShape}
      propValues={propValues}
      updateProps={updateItems}
      isNested={true}
    />
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
    value: value,
  };
}
