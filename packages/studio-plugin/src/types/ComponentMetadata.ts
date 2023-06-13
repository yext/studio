import { FileMetadataKind } from "./FileMetadata.js";
import { PropShape } from "./PropShape.js";
import { PropValues } from "./PropValues.js";

export type ComponentMetadata = {
  kind: FileMetadataKind.Component;
  metadataUUID: string;
  filepath: string;
  initialProps?: PropValues;
  propShape?: PropShape;
  acceptsChildren?: boolean;
};
