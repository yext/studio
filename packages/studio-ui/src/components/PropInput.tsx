import { PropType, PropValueKind, PropValueType } from "@yext/studio-plugin";
import { ChangeEvent, useCallback } from "react";
import Toggle from "./common/Toggle";
import PropValueHelpers from "../utils/PropValueHelpers";
import ColorPicker from "./common/ColorPicker";
import NumberPropInput from "./NumberPropInput";
import UnionPropInput from "./UnionPropInput";
import StringPropInput from "./StringPropInput";
import TailwindPropInput from "./TailwindPropInput";

interface PropInputProps<T = string | number | boolean> {
  propType: PropType;
  propValue?: T;
  onChange: (value: T) => void;
  propKind: PropValueKind;
  inputId?: string;
}

/**
 * Renders the input element of a PropEditor component, that
 * will update the corresponding prop's value for the active
 * component based on user's input.
 */
export default function PropInput({
  propType,
  propValue,
  onChange,
  propKind,
  inputId,
}: PropInputProps): JSX.Element {
  const { type, unionValues } = propType;
  const handleChangeEvent = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const getValue = () => {
        if (type === PropValueType.number) {
          return e.target.valueAsNumber;
        } else if (type === PropValueType.boolean) {
          return e.target.checked;
        }
        return e.target.value;
      };
      onChange(getValue());
    },
    [onChange, type]
  );

  const isUndefinedValue = propValue === undefined;
  const displayValue =
    propValue ?? PropValueHelpers.getPropInputDefaultValue(propType, propKind);

  if (unionValues) {
    return (
      <UnionPropInput
        unionValues={unionValues}
        propValue={propValue as string | undefined}
        onChange={onChange}
        disabled={isUndefinedValue}
      />
    );
  }

  switch (type) {
    case PropValueType.number:
      return (
        <NumberPropInput
          onChange={onChange}
          value={(propValue ?? "") as number}
          disabled={isUndefinedValue}
          inputId={inputId}
        />
      );
    case PropValueType.string:
      return (
        <StringPropInput
          onChange={onChange}
          value={displayValue as string}
          propKind={propKind}
          disabled={isUndefinedValue}
          inputId={inputId}
        />
      );
    case PropValueType.boolean:
      return (
        <Toggle
          checked={displayValue as boolean}
          onToggle={handleChangeEvent}
          disabled={isUndefinedValue}
          inputId={inputId}
        />
      );
    case PropValueType.HexColor:
      return (
        <ColorPicker
          onChange={handleChangeEvent}
          value={propValue as string | undefined}
          inputId={inputId}
        />
      );
    case PropValueType.TailwindClass:
      return (
        <TailwindPropInput
          onChange={onChange}
          disabled={isUndefinedValue}
          value={displayValue as string}
        />
      );
    default:
      return <div>Unknown PropValueType {type}.</div>;
  }
}
