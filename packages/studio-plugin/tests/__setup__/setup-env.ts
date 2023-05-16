import { Result } from "true-myth";
import { printReceived, printExpected } from "jest-matcher-utils";
import { StudioError } from "../../src/errors/StudioError";

function toHaveErrorMessage(
  actual: Result<unknown, StudioError<unknown>>,
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

  const actualErrorMessage = actual.error.message;
  const pass = !!actualErrorMessage.match(expected);

  if (!pass) {
    return {
      pass,
      message: () =>
        `Expected Error of ${printExpected(expected)}, received ${printReceived(
          actualErrorMessage
        )}`,
    };
  }

  return {
    pass: true,
    message: () => "",
  };
}

expect.extend({
  toHaveErrorMessage,
});
