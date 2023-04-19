import { useMemo, useState } from "react";
import { debounce } from "lodash";
import { useHasTemporalChange } from "../hooks/useHasTemporalChange";
import { useHasActiveComponentChange } from "../hooks/useHasActiveComponentChange";

interface DebouncedInputProps<T> {
  value?: T;
  onChange: (value: T) => void;
  renderInput: (onChange: (value: T) => void, value?: T) => JSX.Element;
}

/**
 * Handles the debouncing for changes made to an input element's value.
 */
export default function DebouncedInput<T>({
  value,
  onChange,
  renderInput,
}: DebouncedInputProps<T>): JSX.Element {
  const [inputValue, setInputValue] = useState(value);
  const hasTemporalChange = useHasTemporalChange();
  const hasActiveComponentChange = useHasActiveComponentChange();
  if (hasTemporalChange || hasActiveComponentChange) {
    setInputValue(value);
  }

  const handleChange = useMemo(() => {
    const debouncedOnChange = debounce(onChange, 500);
    return (val: T) => {
      debouncedOnChange(val);
      setInputValue(val);
    };
  }, [onChange]);

  return renderInput(handleChange, inputValue);
}
