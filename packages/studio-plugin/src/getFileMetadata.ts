import ComponentFile from "./parsing/ComponentFile";
import { FileMetadataKind } from "./types/FileMetadata";
import { PropShape } from "./types/PropShape";

export type GetFileMetadataFn = (filepath?: string) => {
  kind: FileMetadataKind;
  metadataUUID?: string;
  propShape?: PropShape;
};

/**
 * This is a temporary implementation to get the file metadata. Once the
 * state manager is implemented, this data will be computed elsewhere and
 * stored there.
 *
 * TODO: update to get component metadata from where it's computed for the
 * state manager.
 */

export const getFileMetadata: GetFileMetadataFn = (filepath?: string) => {
  let propShape: PropShape | undefined = undefined;
  if (filepath) {
    const componentFile = new ComponentFile(filepath);
    propShape = componentFile.getComponentMetadata().propShape;
  }

  const kind = filepath?.includes("/components/")
    ? FileMetadataKind.Component
    : FileMetadataKind.Module;

  return {
    kind,
    metadataUUID: filepath,
    propShape,
  };
};
