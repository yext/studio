import { PropValues } from "./PropValues";

export type ComponentState = {
  name: string,
  props: PropValues,
  uuid: string,
  metadataUUID?: string,
  parentUUID?: string
}
 