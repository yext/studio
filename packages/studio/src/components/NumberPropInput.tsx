import { PropValueKind, PropValueType, TypeGuards } from "@yext/studio-plugin";
import { ChangeEvent, useCallback } from "react";
import TemplateExpressionFormatter from "../utils/TemplateExpressionFormatter";
import FieldPickerInput from "./FieldPicker/FieldPickerInput";

interface NumberPropInputProps {
  value: number;
  onChange: (value: number) => void;
  propKind: PropValueKind;
  disabled?: boolean;
}

export default function NumberPropInput({
  value,
  onChange,
  propKind,
  disabled,
}: NumberPropInputProps): JSX.Element {
  const handleChangeEvent = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      onChange(0); // todo
    },
    [onChange, propKind]
  );

  const displayValue = value;

  const appendField = useCallback(
    (fieldId: string) => {
      const documentUsage = "${" + fieldId + "}";
      const appendedValue = displayValue
        ? `${displayValue} ${documentUsage}`
        : documentUsage;
      onChange(0); //todo
    },
    [displayValue, onChange]
  );

  const fieldPickerFilter = useCallback(
    (value: unknown) =>
      TypeGuards.valueMatchesPropType({ type: PropValueType.string }, value),
    []
  );

  return (
    <FieldPickerInput
      onInputChange={handleChangeEvent}
      handleFieldSelection={appendField}
      displayValue={displayValue}
      fieldFilter={fieldPickerFilter}
      disabled={disabled}
    />
  );
}
