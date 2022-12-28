import { PageSliceStates } from "../../src/store/models/slices/PageSlice";
import mockStore from "./mockStore";

export function mockPageSliceStates(initialState: PageSliceStates): void {
  mockStore({ pages: initialState });
}
