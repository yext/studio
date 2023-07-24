import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { debounce } from "lodash";
import PropValueHelpers from "../../utils/PropValueHelpers";
import { PropValueKind, PropValueType } from "@yext/studio-plugin";

const defaultValue = PropValueHelpers.getPropInputDefaultValue(
  { type: PropValueType.HexColor },
  PropValueKind.Literal
) as string;

interface ColorPickerProps {
  value: string | undefined;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

/**
 * Color picker input element with debounced state updates.
 */
export default function ColorPicker({
  value,
  onChange,
}: ColorPickerProps): JSX.Element {
  const [inputValue, setInputValue] = useState(value);
  const isUndefinedValue = value === undefined;

  useEffect(() => {
    setInputValue(value ?? defaultValue);
  }, [value]);

  const handleChange = useMemo(() => {
    const debouncedOnChange = debounce(onChange, 100);
    return (e: ChangeEvent<HTMLInputElement>) => {
      debouncedOnChange(e);
      setInputValue(e.target.value);
    };
  }, [onChange]);

  if (isUndefinedValue) {
    return <span className="text-sm text-gray-400 mt-0.5 mb-1">#RRGGBB</span>;
  } else {
    return <input type="color" onChange={handleChange} value={inputValue} />;
  }
}
