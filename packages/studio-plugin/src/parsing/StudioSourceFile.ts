import { Project } from "ts-morph";
import typescript from "typescript";
import { ComponentState } from "../types/State";
import { Mixin } from "ts-mixer";
import StudioSourceFileWriter from "./StudioSourceFileWriter";
import StudioSourceFileParser, { GetFileMetadata } from "./StudioSourceFileParser";

/**
 * StudioSourceFile contains shared business logic for parsing and updating source
 * file used by Studio. Lower level details should be delegated to separate static
 * classes/helper functions.
 */
export default class StudioSourceFile extends Mixin(
  StudioSourceFileWriter,
  StudioSourceFileParser
) {
  constructor(filepath: string, getFileMetadata: GetFileMetadata, project: Project) {
    super(filepath, getFileMetadata, project);
  }

  getFilepath() {
    return this.filepath;
  }

  /**
   * Performs an Array.prototype.map over the given {@link ComponentState}s in
   * a level order traversal, starting from the leaf nodes (deepest children)
   * and working up to root node.
   *
   * @param componentStates - the component tree to perform on
   * @param handler - a function to execute on each component
   * @param parent - the top-most parent or root node to work up to
   *
   * @returns an array of elements returned by the handler function
   */
  mapComponentStates<T>(
    componentStates: ComponentState[],
    handler: (component: ComponentState, mappedChildren: T[]) => T,
    parent?: ComponentState
  ): T[] {
    const directChildren: ComponentState[] = [];
    const nonDirectChildren: ComponentState[] = [];
    componentStates.forEach((component) => {
      if (component.parentUUID === parent?.uuid) {
        directChildren.push(component);
      } else if (component.uuid !== parent?.uuid) {
        nonDirectChildren.push(component);
      }
    });
    return directChildren.map((component) => {
      const children = this.mapComponentStates(
        nonDirectChildren,
        handler,
        component
      );
      return handler(component, children);
    });
  }
}
