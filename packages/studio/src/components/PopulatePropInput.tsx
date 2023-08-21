import { PropValueKind, PropValueType, TypeGuards } from "@yext/studio-plugin";
import { ChangeEvent, useCallback, useMemo } from "react";
import TemplateExpressionFormatter from "../utils/TemplateExpressionFormatter";
import FieldPickerInput from "./FieldPicker/FieldPickerInput";
import { get } from "lodash";
import useStudioStore from "../store/useStudioStore";
import useRawSiteSettings from "../hooks/useRawSiteSettings";

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
  const expressionSources = useExpressionSources();
  const handleChangeEvent = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      if (typeof value === "string") {
        const val =
          propKind === PropValueKind.Expression
            ? TemplateExpressionFormatter.getRawValue(e.target.value)
            : e.target.value;
        onChange(val);
      } else {
        const val = Number(e.target.value);
        onChange(val);
      }
    },
    [onChange, propKind, value]
  );

  const displayValue =
    propKind === PropValueKind.Expression && value === "string"
      ? TemplateExpressionFormatter.getTemplateStringDisplayValue(value)
      : value;

  // Appends if string. Replaces if number.
  const appendField = useCallback(
    (fieldId: string) => {
      if (typeof value === "string") {
        const documentUsage = "${" + fieldId + "}";
        const appendedValue = displayValue
          ? `${displayValue} ${documentUsage}`
          : documentUsage;
        onChange(TemplateExpressionFormatter.getRawValue(appendedValue));
      } else {
        const newPropValue = get(
          { document: expressionSources["document"] },
          fieldId
        );
        onChange(newPropValue);
      }
    },
    [displayValue, onChange, value, expressionSources]
  );

  const fieldPickerStringFilter = useCallback(
    (value: unknown) =>
      TypeGuards.valueMatchesPropType({ type: PropValueType.string }, value),
    []
  );

  const fieldPickerNumberFilter = useCallback(
    (value: unknown) =>
      TypeGuards.valueMatchesPropType({ type: PropValueType.number }, value),
    []
  );

  return (
    <FieldPickerInput
      onInputChange={handleChangeEvent}
      handleFieldSelection={appendField}
      displayValue={displayValue}
      fieldFilter={
        typeof value === "string"
          ? fieldPickerStringFilter
          : fieldPickerNumberFilter
      }
      disabled={disabled}
    />
  );
}

function useExpressionSources() {
  const activeEntityData = useStudioStore((store) =>
    store.pages.getActiveEntityData()
  );
  const rawSiteSettings = useRawSiteSettings();
  const pageExpressionSources = useMemo(
    () => ({
      document: activeEntityData,
      siteSettings: rawSiteSettings,
    }),
    [activeEntityData, rawSiteSettings]
  );

  return pageExpressionSources;
}
