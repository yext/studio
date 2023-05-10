/**
 * An interface that represents the different kinds of errors that can occur within Studio.
 */
export interface StudioError<T> {
  kind: T;
  message: string;
  stack?: string;
}
