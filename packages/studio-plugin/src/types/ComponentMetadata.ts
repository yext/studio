import { PropShape } from "./PropShape";
import { PropValues } from "./PropValues";

export enum FileMetadataKind {
  Component = "componentMetadata",
}

export type ComponentMetadata = {
  kind: FileMetadataKind.Component;
  initialProps?: PropValues;
  propShape?: PropShape;
  acceptsChildren?: boolean;
};
