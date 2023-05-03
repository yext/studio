import { Result } from "true-myth";
import { printReceived, printExpected } from "jest-matcher-utils";

function toHaveErrorCause(
  actual: Result<unknown, { cause: Error }>,
  expected: string | RegExp
) {
  if (!actual.isErr) {
    return {
      pass: false,
      message: () =>
        `Received ${printReceived(
          actual.value
        )} instead of the error ${printExpected(expected)}`,
    };
  }

  const actualErrorMessage = actual.error.cause.message;
  const pass = !!actualErrorMessage.match(expected);

  if (!pass) {
    return {
      pass,
      message: () =>
        `Expected Error of ${printExpected(
          expected
        )}, received ${actualErrorMessage}}`,
    };
  }

  return {
    pass: true,
    message: () => "",
  };
}

expect.extend({
  toHaveErrorCause,
});
