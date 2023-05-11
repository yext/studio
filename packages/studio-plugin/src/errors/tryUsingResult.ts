import { Result } from "true-myth";
import { ParsingError, ParsingErrorKind } from "./ParsingError";
import prettyPrintError from "./prettyPrintError";

export default function tryUsingResult<T>(
  errorKind: ParsingErrorKind,
  message: string,
  body: () => T
): Result<T, ParsingError> {
  try {
    return Result.ok(body());
  } catch (err: unknown) {
    if (!(err instanceof Error)) {
      throw err;
    }

    prettyPrintError(message, err.stack);

    return Result.err(new ParsingError(errorKind, err.message, err.stack));
  }
}
