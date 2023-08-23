import { PropValueType, TypeGuards } from "@yext/studio-plugin";
import { ChangeEvent, useCallback } from "react";
import FieldPickerInput from "./FieldPicker/FieldPickerInput";

interface PropInputProps {
  value: number;
  onChange: (value: number | string) => void;
  disabled?: boolean;
}

/**
 * Renders the input element of a number prop, that will update the
 * corresponding prop's value for the active component based on a user's input.
 */
export default function NumberPropInput({
  value,
  onChange,
  disabled,
}: PropInputProps): JSX.Element {
  const handleChangeEvent = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const val = Number(e.target.value);
      if (!isNaN(val)) {
        onChange(val);
      }
    },
    [onChange]
  );

  return (
    <FieldPickerInput
      onInputChange={handleChangeEvent}
      handleFieldSelection={onChange}
      displayValue={value}
      fieldFilter={fieldPickerFilter}
      disabled={disabled}
    />
  );
}

function fieldPickerFilter(value: unknown) {
  return TypeGuards.valueMatchesPropType({ type: PropValueType.number }, value);
}
