import {
  PropType,
  PropValueKind,
  PropValueType,
  TypeGuards,
} from "@yext/studio-plugin";
import { ChangeEvent, useCallback, useLayoutEffect } from "react";
import Toggle from "./common/Toggle";
import PropValueHelpers from "../utils/PropValueHelpers";
import TemplateExpressionFormatter from "../utils/TemplateExpressionFormatter";
import FieldPickerInput from "./FieldPicker/FieldPickerInput";
import ColorPicker from "./common/ColorPicker";

interface PropInputProps<T = string | number | boolean> {
  propType: PropType;
  propValue?: T;
  onChange: (value: T) => void;
  unionValues?: string[];
  propKind: PropValueKind;
}

const inputBoxCssClasses =
  "border border-gray-300 focus:border-indigo-500 rounded-lg p-2";

const selectCssClasses =
  "bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5";

/**
 * Renders the input element of a PropEditor component, that
 * will update the corresponding prop's value for the active
 * component based on user's input.
 */
export default function PropInput({
  propType,
  propValue,
  onChange,
  unionValues,
  propKind,
}: PropInputProps): JSX.Element {
  const { type } = propType;
  const handleChangeEvent = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const getValue = () => {
        if (e.target instanceof HTMLSelectElement) {
          return e.target.value;
        }
        if (type === PropValueType.number) {
          return e.target.valueAsNumber;
        } else if (type === PropValueType.boolean) {
          return e.target.checked;
        } else if (
          propKind === PropValueKind.Expression &&
          type === PropValueType.string
        ) {
          return TemplateExpressionFormatter.getRawValue(e.target.value);
        }
        return e.target.value;
      };
      onChange(getValue());
    },
    [onChange, propKind, type]
  );
  const displayValue = useDisplayValue(propValue, type, propKind, onChange);

  const appendField = useCallback(
    (fieldId: string) => {
      const documentUsage = "${" + fieldId + "}";
      const appendedValue = displayValue
        ? `${displayValue} ${documentUsage}`
        : documentUsage;
      onChange(TemplateExpressionFormatter.getRawValue(appendedValue));
    },
    [displayValue, onChange]
  );

  const fieldPickerFilter = useCallback(
    (value: unknown) => TypeGuards.valueMatchesPropType(propType, value),
    [propType]
  );

  if (unionValues) {
    return (
      <select
        onChange={handleChangeEvent}
        className={selectCssClasses}
        value={propValue as string}
      >
        {unionValues.map((val) => {
          return (
            <option value={val} key={val}>
              {val}
            </option>
          );
        })}
      </select>
    );
  }

  switch (type) {
    case PropValueType.number:
      return (
        <input
          type="number"
          onChange={handleChangeEvent}
          className={inputBoxCssClasses}
          value={displayValue as number}
        />
      );
    case PropValueType.string:
      return (
        <FieldPickerInput
          onInputChange={handleChangeEvent}
          handleFieldSelection={appendField}
          displayValue={displayValue as string}
          fieldFilter={fieldPickerFilter}
        />
      );
    case PropValueType.boolean:
      return (
        <Toggle
          checked={displayValue as boolean}
          onToggle={handleChangeEvent}
        />
      );
    case PropValueType.HexColor:
      return (
        <ColorPicker
          onChange={handleChangeEvent}
          value={displayValue as string}
        />
      );
    case PropValueType.Array:
      return (
        <FieldPickerInput
          onInputChange={handleChangeEvent}
          handleFieldSelection={onChange}
          displayValue={displayValue as string}
          fieldFilter={fieldPickerFilter}
        />
      );
    default:
      return <div>Unknown PropValueType {type}.</div>;
  }
}

function useDisplayValue(
  propValue: string | number | boolean | undefined,
  propType: PropValueType,
  propKind: PropValueKind,
  onChange: (value: string | number | boolean) => void
) {
  useLayoutEffect(() => {
    if (propValue === undefined) {
      onChange(PropValueHelpers.getPropInputDefaultValue(propType, propKind));
    }
  }, [propValue, onChange, propType, propKind]);

  const propValueWithDefaulting =
    propValue ?? PropValueHelpers.getPropInputDefaultValue(propType, propKind);
  if (propKind === PropValueKind.Expression) {
    if (typeof propValueWithDefaulting !== "string") {
      throw new Error(
        `Only strings are supported as the value for expression props. Received: "${propValueWithDefaulting}".`
      );
    }
    if (propType === PropValueType.string) {
      return TemplateExpressionFormatter.getTemplateStringDisplayValue(
        propValueWithDefaulting
      );
    }
  }
  return propValueWithDefaulting;
}
