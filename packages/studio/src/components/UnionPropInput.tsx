import { ChangeEvent, useCallback } from "react";

interface UnionPropInputProps {
  unionValues: string[];
  propValue: string;
  onChange: (value: string) => void;
}

const selectCssClasses =
  "bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5";

/**
 * Renders the dropdown for a string union prop, that will update the
 * corresponding prop's value for the active component based on the user's
 * selection.
 */
export default function UnionPropInput({
  unionValues,
  propValue,
  onChange,
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
      className={selectCssClasses}
      value={propValue}
    >
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
