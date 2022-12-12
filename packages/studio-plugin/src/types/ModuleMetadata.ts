import { ComponentState } from "./State";
import { FileMetadataKind } from "./FileMetadata";
import { PropShape } from "./PropShape";
import { PropValues } from "./PropValues";

export type ModuleMetadata = {
  kind: FileMetadataKind.Module;
  componentTree: ComponentState[];
  initialProps?: PropValues;
  propShape?: PropShape;
};
