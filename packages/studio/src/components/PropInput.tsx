import { PropValueType } from "@yext/studio-plugin";
import { ChangeEvent, useCallback, useLayoutEffect } from "react";
import Toggle from "./common/Toggle";
import getPropTypeDefaultValue from "../utils/getPropTypeDefaultValue";

interface PropInputProps<T = string | number | boolean> {
  propType: PropValueType;
  currentPropValue?: T;
  onChange: (value: T) => void;
}

const inputBoxCssClasses =
  "border border-gray-500 focus:border-blue-600 rounded-lg px-2 py-1 w-full";

/**
 * Renders the input element of a PropEditor component, that
 * will update the corresponding prop's value for the active
 * component based on user's input.
 */
export default function PropInput({
  propType,
  currentPropValue,
  onChange,
}: PropInputProps): JSX.Element {
  const onInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      let value: string | number | boolean = e.target.value;
      if (propType === PropValueType.number) {
        value = e.target.valueAsNumber;
      } else if (propType === PropValueType.boolean) {
        value = e.target.checked;
      }
      onChange(value);
    },
    [onChange, propType]
  );

  useLayoutEffect(() => {
    if (currentPropValue === undefined) {
      onChange(getPropTypeDefaultValue(propType))
    }
  })
  const propVal = currentPropValue ?? getPropTypeDefaultValue(propType);

  switch (propType) {
    case PropValueType.number:
      return (
        <input
          type="number"
          onChange={onInputChange}
          className={inputBoxCssClasses}
          value={propVal as number}
        />
      );
    case PropValueType.string:
      return (
        <input
          type="text"
          onChange={onInputChange}
          className={inputBoxCssClasses}
          value={propVal as string}
        />
      );
    case PropValueType.boolean:
      return <Toggle checked={propVal as boolean} onToggle={onInputChange} />;
    case PropValueType.HexColor:
      return (
        <input
          type="color"
          onChange={onInputChange}
          value={propVal as string}
        />
      );
    default:
      return <div>Unknown PropValueType {propType}.</div>;
  }
}
