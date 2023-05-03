import { Result } from "true-myth"
import { Err, Ok } from "true-myth/dist/public/result"

export function assertIsOk<T, E>(result: Result<T, E>): asserts result is Ok<T, E> {
  expect(result.isOk).toBeTruthy()
}

export function assertIsErr<T, E>(result: Result<T, E>): asserts result is Err<T, E> {
  expect(result.isErr).toBeTruthy()
}