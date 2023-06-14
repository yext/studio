import { FileMetadataKind } from "./FileMetadata";
import { PropShape } from "./PropShape";
import { PropValues } from "./PropValues";

export type ComponentMetadata = {
  kind: FileMetadataKind.Component;
  metadataUUID: string;
  filepath: string;
  initialProps?: PropValues;
  propShape?: PropShape;
  acceptsChildren?: boolean;
};
