import ComponentFile from "./parsing/ComponentFile";
import ModuleFile from "./parsing/ModuleFile";
import { FileMetadataKind } from "./types/FileMetadata";
import { PropShape } from "./types/PropShape";

/**
 * This is a temporary implementation to get the file metadata. Once the
 * state manager is implemented, this data will be computed elsewhere and
 * stored there.
 *
 * TODO: update to get component metadata from where it's computed for the
 * state manager.
 */

export function getFileMetadata(filepath?: string): {
  kind: FileMetadataKind;
  metadataUUID?: string;
  propShape?: PropShape;
} {
  let propShape: PropShape | undefined = undefined;
  const kind = filepath?.includes("/modules/")
    ? FileMetadataKind.Module
    : FileMetadataKind.Component;

  if (filepath) {
    if (kind === FileMetadataKind.Component) {
      const componentFile = new ComponentFile(filepath);
      propShape = componentFile.getComponentMetadata().propShape;
    }
    if (kind === FileMetadataKind.Module) {
      const componentFile = new ModuleFile(filepath);
      propShape = componentFile.getModuleMetadata().propShape;
    }
  }

  return {
    kind,
    metadataUUID: filepath,
    propShape,
  };
}
