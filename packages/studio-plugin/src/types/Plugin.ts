import { FileMetadataKind } from "./FileMetadata";
import { PropShape } from "./PropShape";
import { PropValues } from "./PropValues";

export type PluginDeclaration = {
  name: string;
  components: string[];
}

export type PluginMetadata = {
  kind: FileMetadataKind.Component;
  metadataUUID: string;
  filepath: string;
  initialProps?: PropValues;
  propShape?: PropShape;
  acceptsChildren?: boolean;
}