import { useEffect, useMemo, useState } from "react";
import { debounce } from "lodash";
import useStudioStore from "../store/useStudioStore";
import useTemporalStore from "../store/useTemporalStore";

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
  useEffect(() => {
    if (hasTemporalChange || hasActiveComponentChange) {
      setInputValue(value);
    }
  }, [hasActiveComponentChange, hasTemporalChange, value]);

  const handleChange = useMemo(() => {
    const debouncedOnChange = debounce(onChange, 500);
    return (val: T) => {
      debouncedOnChange(val);
      setInputValue(val);
    };
  }, [onChange]);

  return renderInput(handleChange, inputValue);
}

/**
 * This hook returns whether or not the active component has changed.
 */
function useHasActiveComponentChange(): boolean {
  const activeComponentUUIDInStore = useStudioStore().pages.activeComponentUUID;
  const [activeComponentUUID, setActiveComponentUUID] = useState(
    activeComponentUUIDInStore
  );
  const hasActiveComponentChange =
    activeComponentUUIDInStore !== activeComponentUUID;

  useEffect(() => {
    if (hasActiveComponentChange) {
      setActiveComponentUUID(activeComponentUUIDInStore);
    }
  }, [hasActiveComponentChange, activeComponentUUIDInStore]);

  return hasActiveComponentChange;
}

/**
 * This hook returns whether or not a temporal change (i.e. undo or redo) has
 * occurred.
 */
function useHasTemporalChange(): boolean {
  const numFutureStatesInStore = useTemporalStore(
    (store) => store.futureStates.length
  );
  const [numFutureStates, setNumFutureStates] = useState(
    numFutureStatesInStore
  );
  const hasTemporalChange = numFutureStatesInStore !== numFutureStates;

  useEffect(() => {
    if (hasTemporalChange) {
      setNumFutureStates(numFutureStatesInStore);
    }
  }, [hasTemporalChange, numFutureStatesInStore]);

  return hasTemporalChange;
}
