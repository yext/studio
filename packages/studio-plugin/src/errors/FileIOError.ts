import { StudioError } from "./StudioError";

export enum IOErrorKind {
  FailedToImportFile = "FailedToImportFile",
}

/**
 * An interface representing errors that occur during interactions with the Filesystem.
 */
export interface FileIOError extends StudioError<`${IOErrorKind}`> {
  kind: `${IOErrorKind}`;
}
