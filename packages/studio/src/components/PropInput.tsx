import { PropValueKind, PropValueType } from "@yext/studio-plugin";
import { ChangeEvent, useCallback, useLayoutEffect } from "react";
import Toggle from "./common/Toggle";
import getPropTypeDefaultValue from "../utils/getPropTypeDefaultValue";
import ExpressionFormatter from "../utils/ExpressionFormatter";

interface PropInputProps<T = string | number | boolean> {
  propType: PropValueType;
  propValue?: T;
  onChange: (value: T) => void;
  unionValues?: string[];
  propKind: PropValueKind;
}

const inputBoxCssClasses =
  "border border-gray-300 focus:border-indigo-500 rounded-lg p-2 w-full";

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
  const onInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      let value: string | number | boolean = e.target.value;
      if (propType === PropValueType.number) {
        value = e.target.valueAsNumber;
      } else if (propType === PropValueType.boolean) {
        value = e.target.checked;
      } else if (propKind === PropValueKind.Expression) {
        value = ExpressionFormatter.getRawValue(value);
      }
      onChange(value);
    },
    [onChange, propType, propKind]
  );

  const displayValue = useDisplayValue(propValue, propType, propKind, onChange);

  const onSelectChange = useCallback(
    (e: ChangeEvent<HTMLSelectElement>) => {
      onChange(e.target.value);
    },
    [onChange]
  );

  if (unionValues) {
    return (
      <select onChange={onSelectChange} className={selectCssClasses}>
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

  switch (propType) {
    case PropValueType.number:
      return (
        <input
          type="number"
          onChange={onInputChange}
          className={inputBoxCssClasses}
          value={displayValue as number}
        />
      );
    case PropValueType.string:
      return (
        <input
          type="text"
          onChange={onInputChange}
          className={inputBoxCssClasses}
          value={displayValue as string}
        />
      );
    case PropValueType.boolean:
      return (
        <Toggle checked={displayValue as boolean} onToggle={onInputChange} />
      );
    case PropValueType.HexColor:
      return (
        <input
          type="color"
          onChange={onInputChange}
          value={displayValue as string}
        />
      );
    default:
      return <div>Unknown PropValueType {propType}.</div>;
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
      onChange(getPropTypeDefaultValue(propType, propKind));
    }
  }, [propValue, onChange, propType, propKind]);

  const propValueWithDefaulting =
    propValue ?? getPropTypeDefaultValue(propType, propKind);
  if (propKind === PropValueKind.Expression) {
    if (typeof propValueWithDefaulting !== "string") {
      throw new Error(
        `Expression props are only supported for strings. Received: "${propValueWithDefaulting}".`
      );
    }
    return ExpressionFormatter.getTemplateStringDisplayValue(
      propValueWithDefaulting
    );
  }
  return propValueWithDefaulting;
}
