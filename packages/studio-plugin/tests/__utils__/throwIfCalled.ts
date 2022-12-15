export const throwIfCalled = () => {
  throw new Error("This function should not be called in tests.");
};
