import { PageSliceStates } from "../../src/store/models/slices/PageSlice";
import mockStore from "./mockStore";

export function mockPageSliceStates(
  initialState: Partial<PageSliceStates>
): void {
  const baseState = {
    pendingChanges: {
      pagesToUpdate: new Set<string>(),
      pagesToRemove: new Set<string>(),
    },
  };
  mockStore({
    pages: {
      ...baseState,
      ...initialState,
    },
  });
}
