import { PropValueKind, PropValueType, TypeGuards } from "@yext/studio-plugin";
import { ChangeEvent, useCallback } from "react";
import TemplateExpressionFormatter from "../utils/TemplateExpressionFormatter";
import FieldPickerInput from "./FieldPicker/FieldPickerInput";

interface PropInputProps {
  value: string | number;
  onChange: (value: string | number) => void;
  propKind: PropValueKind;
  disabled?: boolean;
}

/**
 * Renders the input element of a non-union string prop, that will update the
 * corresponding prop's value for the active component based on a user's input.
 */
export default function PopulatePropInput({
  value,
  onChange,
  propKind,
  disabled,
}: PropInputProps): JSX.Element {
  const handleChangeEvent = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      if (typeof value === "string") {
        const val =
        propKind === PropValueKind.Expression
          ? TemplateExpressionFormatter.getRawValue(e.target.value)
          : e.target.value;
        onChange(val);
      } else {
        const val = e.target.valueAsNumber;
        onChange(val);
      }
    },
    [onChange, propKind]
  );

  const displayValue = (typeof value === "string") ? (
    propKind === PropValueKind.Expression
      ? TemplateExpressionFormatter.getTemplateStringDisplayValue(value)
      : value) : value;

  const appendField = useCallback(
    (fieldId: string) => {
      const documentUsage = "${" + fieldId + "}";
      const appendedValue = displayValue
        ? `${displayValue} ${documentUsage}`
        : documentUsage;
      (typeof value === "string") ?
        onChange(TemplateExpressionFormatter.getRawValue(appendedValue)) : onChange(0) //todo;
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
