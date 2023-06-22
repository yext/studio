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

function toHaveWritten(
  this: jest.MatcherContext,
  writeMock: jest.Mock,
  expectedDestination: string,
  expectedContents: string | Buffer
) {
  if (writeMock.mock.calls.length !== 1) {
    return {
      pass: false,
      message: () =>
        `writeFileSync mock called ${printReceived(
          writeMock.mock.calls.length
        )} times. Expected exactly 1 call.`,
    };
  }
  const [actualDestination, actualContents] = writeMock.mock.calls[0];

  if (!this.equals(expectedDestination, actualDestination)) {
    return {
      pass: false,
      message: () =>
        `writeFileSync mock called with destination ${printReceived(
          actualDestination
        )} times. Expected ${printExpected(expectedDestination)}.`,
    };
  }

  const transformedExpectedContents = expectedContents
    .toString()
    .replaceAll("\r\n", "\n");

  if (!this.equals(transformedExpectedContents, actualContents)) {
    return {
      pass: false,
      message: () =>
        `writeFileSync mock called with contents ${printReceived(
          actualContents
        )}. Expected ${printExpected(transformedExpectedContents)}.`,
    };
  }

  return { pass: true, message: () => "" };
}

expect.extend({
  toHaveErrorMessage,
  toHaveWritten,
});
