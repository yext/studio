/**
 * When running jest tests, the stores are not automatically reset before each
 * test run. To avoid the case of the state of one test affecting another, the
 * code below is to mock zustand's store from:
 * https://docs.pmnd.rs/zustand/guides/testing#typescript-usage.
 */

import { act } from "react-dom/test-utils";
import * as registerMessageListenerModule from "../src/messaging/registerMessageListener";
import { MessageIdToListeners } from "../tests/__setup__/setup-env";
const actualCreate = jest.requireActual("zustand");

// track message listeners registered on store creation
export const storeRegisteredListeners: MessageIdToListeners = {};

// a variable to hold reset functions for all stores declared in the app
const storeResetFns = new Set<() => void>();

// when creating a store, we add a reset function for it in the set
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const create = (temporalStore?: any) => {
  if (temporalStore) {
    const { clear } = temporalStore.getState();
    storeResetFns.add(clear);
    return temporalStore.getState;
  } else {
    return (createState: unknown) => {
      const spy = jest.spyOn(registerMessageListenerModule, "default");
      const store = actualCreate(createState);
      // On store creation, save all the store's message listeners.
      spy.mock.calls.forEach(([messageID, cb]) => {
        const listeners = storeRegisteredListeners[messageID];
        if (listeners) {
          listeners.push(cb);
        }
        storeRegisteredListeners[messageID] = [cb];
      });
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
