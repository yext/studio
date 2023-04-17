import { useState } from "react";
import useTemporalStore from "../store/useTemporalStore";

/**
 * This hook returns whether or not a temporal change (i.e. undo or redo) has
 * occurred.
 */
export function useHasTemporalChange(): boolean {
  const numFutureStatesInStore = useTemporalStore(
    (store) => store.futureStates.length
  );
  const [numFutureStates, setNumFutureStates] = useState(
    numFutureStatesInStore
  );

  if (numFutureStatesInStore !== numFutureStates) {
    setNumFutureStates(numFutureStatesInStore);
    return true;
  }
  return false;
}
