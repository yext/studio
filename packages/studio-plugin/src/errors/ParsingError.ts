import { StudioError } from "./StudioError";

export enum ParsingErrorKind {
  FailedToParsePageState = "FailedToParsePageState",
  InvalidStudioConfig = "InvalidStudioConfig",
}

/**
 * An interface representing errors that occur during the parsing of Components,
 * their Prop interfaces, or Component Trees.
 */
export interface ParsingError extends StudioError<`${ParsingErrorKind}`> {
  kind: `${ParsingErrorKind}`;
}
