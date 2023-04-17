import { FileMetadata } from "../types";
import lodash from "lodash";

/**
 * Returns whether the two given {@link FileMetadata} are equivalent.
 * `undefined` and unset values are considered equivalent.
 */
export default function areEqualFileMetadata(
  firstMetadata: FileMetadata,
  secondMetadata: FileMetadata
): boolean {
  return lodash.isEqual(
    removeUndefined(firstMetadata),
    removeUndefined(secondMetadata)
  );
}

function removeUndefined(metadata: FileMetadata): FileMetadata {
  return lodash.omitBy(
    metadata,
    (value) => value === undefined
  ) as FileMetadata;
}
