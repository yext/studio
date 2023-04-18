import { useEffect, useMemo, useState } from "react";
import { debounce } from "lodash";
import { useHasTemporalChange } from "../hooks/useHasTemporalChange";
import useStudioStore from "../store/useStudioStore";

interface DebouncedInputProps<T = string | number | boolean> {
  value?: T;
  onChange: (value: T) => void;
  renderInput: (onChange: (value: T) => void, value?: T) => JSX.Element;
}

export default function DebouncedInput<T>({
  value,
  onChange,
  renderInput,
}: DebouncedInputProps<T>): JSX.Element {
  const [inputValue, setInputValue] = useState(value);
  const hasTemporalChange = useHasTemporalChange();
  const activeComponentUUID = useStudioStore().pages.activeComponentUUID;
  if (hasTemporalChange) {
    setInputValue(value);
  }

  useEffect(() => {
    if (activeComponentUUID) {
      setInputValue(value);
    }
  }, [activeComponentUUID]);

  const handleChange = useMemo(() => {
    const debouncedOnChange = debounce(onChange, 500);
    return (val: T) => {
      debouncedOnChange(val);
      setInputValue(val);
    };
  }, [onChange]);

  return renderInput(handleChange, inputValue);
}
