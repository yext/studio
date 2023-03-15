import { PropValues } from "./PropValues";

export type ComponentState =
  | StandardOrModuleComponentState
  | FragmentState
  | BuiltInState
  | RepeaterState;

export type StandardOrModuleComponentState =
  | StandardComponentState
  | ModuleState;

export enum ComponentStateKind {
  Standard = "standard",
  Module = "module",
  Fragment = "fragment", // when the component is a React.Fragment,
  BuiltIn = "builtIn", // for built in elements like div and img
  Repeater = "repeater", // for a list repeater (map function)
}

export type RepeaterState = {
  kind: ComponentStateKind.Repeater;
  /** A stream document field representing the list of items to map over. */
  listField: string;
  /** The state for the component being repeated in the map function. */
  repeatedComponent: Omit<
    StandardOrModuleComponentState,
    "uuid" | "parentUUID"
  >;
  /** A unique UUID for this specific component instance. */
  uuid: string;
  /** The UUID of the parent component in the tree, if one exists. */
  parentUUID?: string;
};

export type StandardComponentState = {
  kind: ComponentStateKind.Standard;
  /** The name of the component (i.e. Card or Banner). */
  componentName: string;
  /** Represents the props of the component. */
  props: PropValues;
  /** A unique UUID for this specific component instance. */
  uuid: string;
  /**
   * The UUID of the corresponding StandardComponentMetadata or ModuleMetadata.
   */
  metadataUUID: string;
  /** The UUID of the parent component in the tree, if one exists. */
  parentUUID?: string;
};

export type ModuleState = {
  kind: ComponentStateKind.Module;
  /** The name of the component (i.e. Card or Banner). */
  componentName: string;
  /** Represents the props of the component. */
  props: PropValues;
  /** A unique UUID for this specific component instance. */
  uuid: string;
  /**
   * The UUID of the corresponding StandardComponentMetadata or ModuleMetadata.
   */
  metadataUUID: string;
  /** The UUID of the parent component in the tree, if one exists. */
  parentUUID?: string;
};

type FragmentState = {
  kind: ComponentStateKind.Fragment;
  uuid: string;
  parentUUID?: string;
};

export type BuiltInState = {
  kind: ComponentStateKind.BuiltIn;
  componentName: string;
  uuid: string;
  /** We currently do not support props on built in elements. */
  // eslint-disable-next-line @typescript-eslint/ban-types
  props: {};
  parentUUID?: string;
};
