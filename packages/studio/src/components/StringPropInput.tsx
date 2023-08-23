import { PropValueKind, PropValueType, TypeGuards } from "@yext/studio-plugin";
import { ChangeEvent, useCallback } from "react";
import TemplateExpressionFormatter from "../utils/TemplateExpressionFormatter";
import FieldPickerInput from "./FieldPicker/FieldPickerInput";

interface StringPropInputProps {
  value: string;
  onChange: (value: string) => void;
  propKind: PropValueKind;
  disabled?: boolean;
}

/**
 * Renders the input element of a non-union string prop, that will update the
 * corresponding prop's value for the active component based on a user's input.
 */
export default function StringPropInput({
  value,
  onChange,
  propKind,
  disabled,
}: StringPropInputProps): JSX.Element {
  const handleChangeEvent = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const val =
        propKind === PropValueKind.Expression
          ? TemplateExpressionFormatter.getRawValue(e.target.value)
          : e.target.value;
      onChange(val);
    },
    [onChange, propKind]
  );

  const displayValue =
    propKind === PropValueKind.Expression
      ? TemplateExpressionFormatter.getTemplateStringDisplayValue(value)
      : value;

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

function fieldPickerFilter(value: unknown) {
  return TypeGuards.valueMatchesPropType({ type: PropValueType.string }, value);
}
