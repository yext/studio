export const throwIfCalled = jest.fn().mockImplementation(() => {
  throw new Error("This function should not be called");
});
