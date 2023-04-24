import { useCallback, useMemo } from "react";
import useTemporalStore from "../store/useTemporalStore";
import { debounce } from "lodash";

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
