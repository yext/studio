import "@testing-library/jest-dom";
import ResizeObserverPolyfill from "resize-observer-polyfill";

global.ResizeObserver = ResizeObserverPolyfill;

jest.mock("../../src/messaging/sendMessage", () => ({
  __esModule: true,
  default: () => "message was sent successfully via sendMessage()!",
}));

jest.mock("../../src/utils/dynamicImportFromBrowser", () => ({
  __esModule: true,
  default: (absPath: string) => import(absPath),
}));
