import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import { debounce } from "lodash";
import useStudioStore from "../../store/useStudioStore";
import useTemporalStore from "../../store/useTemporalStore";

interface ColorPickerProps {
  value: string;
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
  const activeComponentUUID = useStudioStore().pages.activeComponentUUID;
  const numFutureStates = useTemporalStore(
    (store) => store.futureStates.length
  );
  const activeComponentUUIDRef = useRef(activeComponentUUID);
  const numFutureStatesRef = useRef(numFutureStates);

  useEffect(() => {
    if (
      activeComponentUUID !== activeComponentUUIDRef.current ||
      numFutureStates !== numFutureStatesRef.current
    ) {
      setInputValue(value);
    }
  }, [activeComponentUUID, numFutureStates, value]);

  const handleChange = useMemo(() => {
    const debouncedOnChange = debounce(onChange, 100);
    return (e: ChangeEvent<HTMLInputElement>) => {
      debouncedOnChange(e);
      setInputValue(e.target.value);
    };
  }, [onChange]);

  return <input type="color" onChange={handleChange} value={inputValue} />;
}
