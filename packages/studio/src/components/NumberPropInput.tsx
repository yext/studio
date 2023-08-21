import { PropValueType, TypeGuards } from "@yext/studio-plugin";
import { ChangeEvent, useCallback, useMemo } from "react";
import FieldPickerInput from "./FieldPicker/FieldPickerInput";
import { get } from "lodash";
import useStudioStore from "../store/useStudioStore";
import useRawSiteSettings from "../hooks/useRawSiteSettings";

interface PropInputProps {
  value: number;
  onChange: (value: number) => void;
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
  const expressionSources = useExpressionSources();
  const handleChangeEvent = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const val = Number(e.target.value);
      onChange(val);
    },
    [onChange]
  );

  const appendField = useCallback(
    (fieldId: string) => {
      const newPropValue = get(
        { document: expressionSources["document"] },
        fieldId
      );
      onChange(newPropValue);
    },
    [onChange, expressionSources]
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
      displayValue={value}
      fieldFilter={fieldPickerNumberFilter}
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
