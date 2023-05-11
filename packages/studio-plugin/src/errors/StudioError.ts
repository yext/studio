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

  /**
   * Type Guard to see if the provided value is a Studio Error. Note that a native Error
   * will not pass this check since Studio Error has the 'kind' discriminator.
   */
  static isStudioError(err: unknown): err is StudioError<unknown> {
    const expectedProperties = ["kind", "message"];
    return (
      !!err &&
      typeof err === "object" &&
      expectedProperties.every((prop) => prop in err)
    );
  }
}
