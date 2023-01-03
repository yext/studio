/**
 * When running jest tests, the stores are not automatically reset before each
 * test run. To avoid the case of the state of one test affecting another, the
 * code below is to mock zustand's store from:
 * https://docs.pmnd.rs/zustand/guides/testing#typescript-usage.
 */

import { act } from "react-dom/test-utils";
const actualCreate = jest.requireActual("zustand");

// a variable to hold reset functions for all stores declared in the app
const storeResetFns = new Set<() => void>();

// when creating a store, we add a reset function for it in the set
const create = (temporalStore?: any) => {
  if (temporalStore) {
    const { clear } = temporalStore.getState();
    storeResetFns.add(clear);
    return temporalStore.getState;
  } else {
    return (createState: unknown) => {
      const store = actualCreate(createState);
      const initialState = store.getState();
      storeResetFns.add(() => store.setState(initialState, true));
      return store;
    };
  }
};

// Reset all stores after each test run
beforeEach(() => {
  act(() => storeResetFns.forEach((resetFn) => resetFn()));
});

export default create;
