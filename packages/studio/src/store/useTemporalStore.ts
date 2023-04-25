import { useStore } from "zustand";
import useStudioStore from "./useStudioStore";
import type { TemporalState } from "zundo";
import { StudioStore } from "./models/StudioStore";

export type TemporalStudioStore = Omit<StudioStore, "previousSave">;

/**
 * A state manager for the history of the StudioStore. It tracks the past and
 * future versions of the store and provides actions for navigating between
 * them (`undo()` and `redo()`) and clearing the history (`clear()`).
 */
function useTemporalStore<T>(
  selector: (state: TemporalState<TemporalStudioStore>) => T
): T {
  return useStore(useStudioStore.temporal, selector);
}

export default useTemporalStore;
