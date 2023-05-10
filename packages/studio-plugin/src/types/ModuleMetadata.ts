import { ComponentState } from "./ComponentState";
import { FileMetadataKind } from "./FileMetadata";
import { PropShape } from "./PropShape";
import { PropValues } from "./PropValues";

export type ModuleMetadata = {
  kind: FileMetadataKind.Module;
  componentTree: ComponentState[];
  metadataUUID: string;
  filepath: string;
  initialProps?: PropValues;
  propShape?: PropShape;
};
