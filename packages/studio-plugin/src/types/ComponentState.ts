import { PropValues, TypelessPropVal } from "./PropValues";

export type ComponentState =
  | EditableComponentState
  | FragmentState
  | BuiltInState
  | NonrecoverableErrorComponentState
  | RecoverableErrorComponentState;

export type EditableComponentState =
  | StandardOrModuleComponentState
  | RepeaterState
  | RecoverableErrorComponentState;

export type StandardOrModuleComponentState =
  | StandardComponentState
  // | RecoverableErrorComponentState // ADDED RECOVERABLE
  | ModuleState;

export enum ComponentStateKind {
  Standard = "standard",
  Module = "module",
  Fragment = "fragment", // when the component is a React.Fragment,
  BuiltIn = "builtIn", // for built in elements like div and img
  Repeater = "repeater", // for a list repeater (map function)
  NonrecoverableError = "nonrecoverableError", // when the component file could not be parsed, and cannot be fixed through the studio UI
  RecoverableError = "recoverableError", // when the component file has an error that can be fixed through the studio UI
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
  /**
   * The state for the component being repeated in the map function.
   * TypeScript has issues with the spread operator if StandardOrModuleComponentState
   * and ErrorComponentState are combined into a union.
   **/
  repeatedComponent:
    | Omit<StandardOrModuleComponentState, "uuid" | "parentUUID">
    | Omit<NonrecoverableErrorComponentState | RecoverableErrorComponentState, "uuid" | "parentUUID">;
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

export type NonrecoverableErrorComponentState = {
  kind: ComponentStateKind.NonrecoverableError;
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

export type RecoverableErrorComponentState = {
  kind: ComponentStateKind.RecoverableError;
  componentName: string;
  /**
   * ErrorComponentStates do not fully support props since we're unable to
   * get the underlying type even if props are specified.
   */
  props: PropValues;
  uuid: string;
  metadataUUID: string;
  parentUUID?: string;
  fullText: string;
  message: string;
};