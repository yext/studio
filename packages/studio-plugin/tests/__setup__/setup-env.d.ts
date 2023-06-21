export {};

declare global {
  namespace jest {
    interface Matchers<R> {
      toHaveErrorMessage(expected: string | RegExp): R;
      toHaveWritten(
        expectedDestination: string,
        expectedContents: string | Buffer
      ): R
    }
  }
}
