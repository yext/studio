import { ComponentState } from "../types";

/**
 * A static class for housing various util functions related to component state used by Studio.
 */
export default class ComponentTreeHelpers {
  /**
   * Performs an Array.prototype.map over the given {@link ComponentState}s in
   * a level order traversal, starting from the leaf nodes (deepest children)
   * and working up to root node.
   *
   * @param componentTree - the component tree to perform on
   * @param handler - a function to execute on each component
   * @param parent - the top-most parent or root node to work up to
   *
   * @returns an array of elements returned by the handler function
   */
  static mapComponentTree<T>(
    componentTree: ComponentState[],
    handler: (component: ComponentState, mappedChildren: T[]) => T,
    parent?: ComponentState
  ): T[] {
    const directChildren: ComponentState[] = [];
    const nonDirectChildren: ComponentState[] = [];
    componentTree.forEach((component) => {
      if (component.parentUUID === parent?.uuid) {
        directChildren.push(component);
      } else if (component.uuid !== parent?.uuid) {
        nonDirectChildren.push(component);
      }
    });
    return directChildren.map((component) => {
      const children = this.mapComponentTree(
        nonDirectChildren,
        handler,
        component
      );
      return handler(component, children);
    });
  }
}
