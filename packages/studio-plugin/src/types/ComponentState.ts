import { PropValues } from "./PropValues";

export type ComponentState =
  | EditableComponentState
  | FragmentState
  | BuiltInState;

export type EditableComponentState =
  | StandardOrModuleComponentState
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

export type RepeaterState = {
  kind: ComponentStateKind.Repeater;
  /** An expression representing the list of items to map over. */
  listExpression: string;
  /** The state for the component being repeated in the map function. */
  repeatedComponent: Omit<
    StandardOrModuleComponentState,
    "uuid" | "parentUUID"
  >;
  /** A unique UUID for this specific component instance. */
  uuid: string;
  /** The UUID of the parent component in the tree, if one exists. */
  parentUUID?: string;
  metadataUUID?: never;
};

type FragmentState = {
  kind: ComponentStateKind.Fragment;
  uuid: string;
  parentUUID?: string;
  metadataUUID?: never;
};

export type BuiltInState = {
  kind: ComponentStateKind.BuiltIn;
  componentName: string;
  uuid: string;
  /** We currently do not support props on built in elements. */
  // eslint-disable-next-line @typescript-eslint/ban-types
  props: {};
  parentUUID?: string;
  metadataUUID?: never;
};
