import "@testing-library/jest-dom";
import { MessageID } from "@yext/studio-plugin";
import { ListenerCallbackFn } from "../../src/messaging/registerMessageListener";
import { storeRegisteredListeners } from "../../__mocks__/zustand";
import ResizeObserverPolyfill from "resize-observer-polyfill";

global.ResizeObserver = ResizeObserverPolyfill;

export type MessageIdToListeners = {
  [P in MessageID]?: ListenerCallbackFn<P>[];
};

/**
 * Must be const to prevent reference set to any out-of-scope variable,
 * for jest mock() function to guard against uninitialized mock variables
 */
export const registeredListeners: MessageIdToListeners = {};

/**
 * Functions below are mocked because they contain "import.meta", which
 * is an ESM only feature and Jest currently doesn't have native support
 * for ECMAScript Modules (https://jestjs.io/docs/ecmascript-modules).
 *
 * For each message id, server response for message send from client is
 * default to a non-error payload. The response also trigger callback
 * function of registered listeners for that message id.
 */
jest.mock("../../src/messaging/registerMessageListener", () => ({
  __esModule: true,
  default: (messageID: MessageID, cb: ListenerCallbackFn<MessageID>) => {
    const listeners = registeredListeners[messageID];
    if (listeners) {
      listeners.push(cb);
    } else {
      registeredListeners[messageID] = [cb];
    }
  },
}));
jest.mock("../../src/messaging/sendMessage", () => ({
  __esModule: true,
  default: (messageID: MessageID, _payload) => {
    registeredListeners[messageID]?.forEach((cb) =>
      cb({
        type: "success",
        msg: "Mock response message",
      })
    );
  },
}));

/**
 * Remove test specific message listeners by resetting "registeredListeners" to
 * only store's registered listeners.
 */
beforeEach(() => {
  Object.keys(registeredListeners).forEach((messageId) => {
    const studioCallbacks = storeRegisteredListeners[messageId];
    if (studioCallbacks) {
      registeredListeners[messageId] = studioCallbacks;
    } else {
      delete registeredListeners[messageId];
    }
  });
});
