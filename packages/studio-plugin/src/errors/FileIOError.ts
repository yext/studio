import { StudioError } from "./StudioError";

export enum IOErrorKind {
  FailedToImportFile = "FailedToImportFile",
}

/**
 * A class representing errors that occur during interactions with the Filesystem.
 */
export class FileIOError extends StudioError<`${IOErrorKind}`> {}
