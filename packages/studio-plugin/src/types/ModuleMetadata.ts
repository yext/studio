import { ComponentState } from "./ComponentState.js";
import { FileMetadataKind } from "./FileMetadata.js";
import { PropShape } from "./PropShape.js";
import { PropValues } from "./PropValues.js";

export type ModuleMetadata = {
  kind: FileMetadataKind.Module;
  componentTree: ComponentState[];
  metadataUUID: string;
  filepath: string;
  initialProps?: PropValues;
  propShape?: PropShape;
};
