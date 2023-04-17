import { useStore } from "zustand";
import useStudioStore from "./useStudioStore";
import type { TemporalState } from "zundo";
import { StudioStore } from "./models/StudioStore";

/**
 * A state manager for the history of the StudioStore. It tracks the past and
 * future versions of the store and provides actions for navigating between
 * them (`undo()` and `redo()`) and clearing the history (`clear()`).
 */
function useTemporalStore<T>(
  selector: (state: TemporalState<Omit<StudioStore, "previousSave">>) => T
): T {
  return useStore(useStudioStore.temporal, selector);
}

export default useTemporalStore;
