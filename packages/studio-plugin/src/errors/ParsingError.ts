import { StudioError } from "./StudioError";

export enum ParsingErrorKind {
  FailedToParsePageState = "FailedToParsePageState",
  InvalidStudioConfig = "InvalidStudioConfig",
  FailedToParseComponentMetadata = "FailedToParseComponentMetadata",
}

/**
 * A class representing errors that occur during the parsing of Components,
 * their Prop interfaces, or Component Trees.
 */
export class ParsingError extends StudioError<`${ParsingErrorKind}`> {}
