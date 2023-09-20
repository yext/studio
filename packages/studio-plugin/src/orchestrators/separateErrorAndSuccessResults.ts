import { Result } from "true-myth";
import { ParsingError } from "../errors/ParsingError";

export default function separateErrorAndSuccessResults<ValueType, SuccessType>(
  nameToSourceFile: Record<string, ValueType>,
  getResult: (sourceFile: ValueType) => Result<SuccessType, ParsingError>
): {
  successes: Record<string, SuccessType>;
  errors: Record<string, ParsingError>;
} {
  return Object.keys(nameToSourceFile).reduce(
    (prev, curr) => {
      const result = getResult(nameToSourceFile[curr]);

      if (result.isOk) {
        prev.successes[curr] = result.value;
      } else {
        prev.errors[curr] = {
          message: result.error.message,
        };
      }

      return prev;
    },
    {
      successes: {},
      errors: {},
    }
  );
}
