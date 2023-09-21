import { ChangeEvent, useCallback } from "react";
import getSelectCssClasses from "../utils/getSelectCssClasses";

interface UnionPropInputProps {
  unionValues: string[];
  propValue: string | undefined;
  onChange: (value: string) => void;
  disabled?: boolean;
}

/**
 * Renders the dropdown for a string union prop, that will update the
 * corresponding prop's value for the active component based on the user's
 * selection.
 */
export default function UnionPropInput({
  unionValues,
  propValue,
  onChange,
  disabled,
}: UnionPropInputProps): JSX.Element {
  const handleChangeEvent = useCallback(
    (e: ChangeEvent<HTMLSelectElement>) => {
      onChange(e.target.value);
    },
    [onChange]
  );

  return (
    <select
      onChange={handleChangeEvent}
      className={getSelectCssClasses()}
      value={propValue ?? ""}
      disabled={disabled}
    >
      {disabled && <option value="" />}
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
