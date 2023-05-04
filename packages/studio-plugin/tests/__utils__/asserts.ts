import { Result } from "true-myth";
import { Ok } from "true-myth/dist/public/result";

export function assertIsOk<T, E>(
  result: Result<T, E>
): asserts result is Ok<T, E> {
  expect(result.isOk).toBeTruthy();
}
