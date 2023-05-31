/**
 * When running jest tests, the stores are not automatically reset before each
 * test run. To avoid the case of the state of one test affecting another, the
 * code below is to mock zustand's store from:
 * https://docs.pmnd.rs/zustand/guides/testing#typescript-usage.
 */

import { act } from "react-dom/test-utils";
const { create: actualCreate } = jest.requireActual("zustand");

// a variable to hold reset functions for all stores declared in the app
const storeResetFns = new Set<() => void>();

// when creating a store, we get its initial state, create a reset function and
// add it in the set
export const create = () => (createState: unknown) => {
  const store = actualCreate(createState);
  const initialState = store.getState();
  storeResetFns.add(() => store.setState(initialState, true));
  return store;
};

// createStore is adapted from
// https://github.com/charkour/zundo/blob/main/packages/zundo/__mocks__/zustand/index.js
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const createStore = (createState?: any) => {
  if (!createState) {
    return createStore;
  }
  const store = actualCreate(createState);
  const initialState = store.getState();
  storeResetFns.add(() => store.setState(initialState, true));
  return store;
};

export const useStore = (temporalStore, selector) => {
  const state = temporalStore.getState();
  storeResetFns.add(state.clear);
  return selector(state);
};

// Reset all stores after each test run
beforeEach(() => {
  act(() => storeResetFns.forEach((resetFn) => resetFn()));
});
