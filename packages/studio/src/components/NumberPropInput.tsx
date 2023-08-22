import { PropValueType, TypeGuards } from "@yext/studio-plugin";
import { ChangeEvent, useCallback } from "react";
import FieldPickerInput from "./FieldPicker/FieldPickerInput";

import TemplateExpressionFormatter from "../utils/TemplateExpressionFormatter";

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
      onChange(val);
    },
    [onChange]
  );

  const appendField = useCallback(
    (fieldId: string) => {
      const documentUsage = "${" + fieldId + "}";
      onChange(TemplateExpressionFormatter.getRawValue(documentUsage));
    },
    [onChange]
  );

  return (
    <FieldPickerInput
      onInputChange={handleChangeEvent}
      handleFieldSelection={appendField}
      displayValue={value}
      fieldFilter={useFieldPickerNumberFilter()}
      disabled={disabled}
    />
  );
}

function useFieldPickerNumberFilter() {
  return useCallback(
    (value: unknown) =>
      TypeGuards.valueMatchesPropType({ type: PropValueType.number }, value),
    []
  );
}
