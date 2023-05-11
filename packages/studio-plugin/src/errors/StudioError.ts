/**
 * An abstract class that represents the different kinds of errors that can occur within Studio.
 */
export abstract class StudioError<T> {
  kind: T;
  message: string;
  stack?: string;

  constructor(kind: T, message: string, stack?: string) {
    this.kind = kind;
    this.message = message;
    this.stack = stack;
  }
}
