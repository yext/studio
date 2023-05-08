import { ComponentState, ErrorComponentState } from "./ComponentState";
import { FileMetadataKind } from "./FileMetadata";
import { PropShape } from "./PropShape";
import { PropValues } from "./PropValues";

export type ModuleMetadata = {
  kind: FileMetadataKind.Module;
  componentTree: (ComponentState | ErrorComponentState)[];
  metadataUUID: string;
  filepath: string;
  initialProps?: PropValues;
  propShape?: PropShape;
};
