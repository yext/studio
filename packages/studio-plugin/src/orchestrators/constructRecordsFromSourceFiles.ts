import { Result } from "true-myth";
import { ParsingError } from "../errors/ParsingError";

export default function constructRecordsFromSourceFiles<
  SourceFile,
  SuccessData
>(
  nameToSourceFile: Record<string, SourceFile>,
  getResult: (sourceFile: SourceFile) => Result<SuccessData, ParsingError>
): {
  nameToSuccessData: Record<string, SuccessData>;
  nameToError: Record<string, { message: string }>;
} {
  return Object.keys(nameToSourceFile).reduce(
    (prev, curr) => {
      const result = getResult(nameToSourceFile[curr]);

      if (result.isOk) {
        prev.nameToSuccessData[curr] = result.value;
      } else {
        prev.nameToError[curr] = {
          message: result.error.message,
        };
      }

      return prev;
    },
    {
      nameToSuccessData: {} as Record<string, SuccessData>,
      nameToError: {} as Record<string, { message: string }>,
    }
  );
}
