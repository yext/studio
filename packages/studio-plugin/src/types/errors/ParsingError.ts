export enum ParsingErrorType {
  FailedToParsePageState = "FailedToParsePageState",
}

/**
 * An interface representing errors that occur during the parsing of Components,
 * their Prop interfaces, or Component Trees.
 */
export interface ParsingError extends Error {
  name: `${ParsingErrorType}`;
}
