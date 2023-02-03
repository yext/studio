import { useStore } from "zustand";
import useStudioStore from "./useStudioStore";

/**
 * A state manager for the history of the StudioStore. It tracks the past and
 * future versions of the store and provides actions for navigating between
 * them (`undo()` and `redo()`) and clearing the history (`clear()`).
 */
function useTemporalStore() {
  return useStore(useStudioStore.temporal);
}

export default useTemporalStore;
