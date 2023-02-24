// global.d.ts
export {};

declare global {
  namespace PlaywrightTest {
    interface Matchers<R> {
      toHaveContents(expectedContents: string): Promise<R>;
    }
  }
}
