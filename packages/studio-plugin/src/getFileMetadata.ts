import ComponentFile from "./parsing/ComponentFile";
import { PropShape } from "./types/PropShape";

/**
 * This is a temporary implementation to get the file metadata. Once the
 * state manager is implemented, this data will be computed elsewhere and
 * stored there.
 *
 * TODO: update to get component metadata from where it's computed for the
 * state manager.
 */
export function getFileMetadata(
  filepath?: string
): { metadataUUID?: string, propShape?: PropShape } {
  let propShape: PropShape | undefined = undefined;
  if (filepath) {
    const componentFile = new ComponentFile(filepath);
    propShape = componentFile.getComponentMetadata().propShape;
  }

  return {
    metadataUUID: filepath,
    propShape
  };
}
