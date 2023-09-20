import { PropValues, TypelessPropVal } from "./PropValues";

export type ComponentState =
  | StandardComponentState
  | FragmentState
  | BuiltInState
  | ErrorComponentState;

export enum ComponentStateKind {
  Standard = "standard",
  Fragment = "fragment", // when the component is a React.Fragment,
  BuiltIn = "builtIn", // for built in elements like div and img
  Error = "error", // when the component file could not be parsed
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
   * The UUID of the corresponding StandardComponentMetadata.
   */
  metadataUUID: string;
  /** The UUID of the parent component in the tree, if one exists. */
  parentUUID?: string;
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

export type ErrorComponentState = {
  kind: ComponentStateKind.Error;
  componentName: string;
  /**
   * ErrorComponentStates do not fully support props since we're unable to
   * get the underlying type even if props are specified.
   */
  props: Record<string, TypelessPropVal>;
  uuid: string;
  metadataUUID: string;
  parentUUID?: string;
  fullText: string;
  message: string;
};
