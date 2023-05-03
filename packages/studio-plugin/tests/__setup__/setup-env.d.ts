export {};

declare global {
  namespace jest {
    interface Matchers<R> {
      toHaveErrorCause(expected: string | RegExp): R;
    }
  }
}
