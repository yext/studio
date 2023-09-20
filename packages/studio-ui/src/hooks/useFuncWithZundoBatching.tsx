import { useCallback, useMemo } from "react";
import useTemporalStore from "../store/useTemporalStore";
import { debounce } from "lodash";

/**
 * Updates a function so it doesn't trigger Zundo store updates until after a
 * debounce period of 500ms. This results in state updates being batched for
 * undo/redo.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useFuncWithZundoBatching<P extends Array<any>, R>(
  func: (...args: P) => R
): typeof func {
  const [pause, resume] = useTemporalStore((store) => [
    store.pause,
    store.resume,
  ]);
  const debouncedResume = useMemo(() => debounce(resume, 500), [resume]);

  return useCallback(
    (...args: P): R => {
      const val = func(...args);
      pause();
      debouncedResume();
      return val;
    },
    [func, debouncedResume, pause]
  );
}
