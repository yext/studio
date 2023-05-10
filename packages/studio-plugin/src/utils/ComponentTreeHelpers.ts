import {
  ComponentState,
  ComponentStateKind,
  ExpressionProp,
  PropValueKind,
  TypelessPropVal,
} from "../types";
import ComponentStateHelpers from "./ComponentStateHelpers";
import TypeGuards from "./TypeGuards";

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
    const { directChildren, otherNodes } =
      ComponentTreeHelpers.separateDescendants(componentTree, parent);
    return directChildren.map((component) => {
      const children = this.mapComponentTree(otherNodes, handler, component);
      return handler(component, children);
    });
  }

  /**
   * Similar to mapComponentTree but guarantees that parent nodes are
   * called before leaf nodes.
   *
   * @param componentTree - the component tree to perform on
   * @param handler - a function to execute on each component
   *
   * @returns an array of elements returned by the handler function
   */
  static mapComponentTreeParentsFirst<T>(
    componentTree: ComponentState[],
    handler: (component: ComponentState, parentValue?: T) => T,
    parent?: ComponentState,
    parentValue?: T
  ): T[] {
    const { directChildren, otherNodes } =
      ComponentTreeHelpers.separateDescendants(componentTree, parent);
    return directChildren.flatMap((component) => {
      const mappedValue = handler(component, parentValue);
      return [
        mappedValue,
        ...ComponentTreeHelpers.mapComponentTreeParentsFirst(
          otherNodes,
          handler,
          component,
          mappedValue
        ),
      ];
    });
  }

  private static separateDescendants(
    componentTree: ComponentState[],
    parent?: ComponentState
  ) {
    const directChildren: ComponentState[] = [];
    const otherNodes: ComponentState[] = [];
    componentTree.forEach((component) => {
      if (component.parentUUID === parent?.uuid) {
        directChildren.push(component);
      } else {
        otherNodes.push(component);
      }
    });
    return { directChildren, otherNodes };
  }

  /**
   * Checks whether the component tree uses a specific expression source, such
   * as `document` or `props`.
   */
  static usesExpressionSource(componentTree: ComponentState[], source: string) {
    const expressions: string[] = componentTree.flatMap((c) => {
      if (c.kind === ComponentStateKind.Error) {
        return this.getExpressionUsagesFromProps(c.props);
      }

      if (!TypeGuards.isEditableComponentState(c)) {
        return [];
      }

      const props =
        ComponentStateHelpers.extractStandardOrModuleComponentState(c).props;
      const expressionPropValues = this.getExpressionUsagesFromProps(props);

      return TypeGuards.isRepeaterState(c)
        ? [...expressionPropValues, c.listExpression]
        : expressionPropValues;
    });

    // This is used to create the regex: /\${source\..*}/
    const regexStr = "\\${" + source + "\\..*}";
    const templateStringRegex = new RegExp(regexStr);

    return expressions.some((e) => {
      return (
        e === source ||
        e.startsWith(source + ".") ||
        e.match(templateStringRegex) ||
        e.includes("${" + source + "}")
      );
    });
  }

  private static getExpressionUsagesFromProps(
    props: Record<string, TypelessPropVal>
  ) {
    return Object.values(props)
      .filter((p): p is ExpressionProp => p.kind === PropValueKind.Expression)
      .map((p) => p.value);
  }

  /**
   * Returns all descendants of the given ComponentState within the given tree.
   */
  static getDescendants(
    ancestorState: ComponentState,
    componentTree: ComponentState[]
  ) {
    const descendants = ComponentTreeHelpers.mapComponentTree<ComponentState[]>(
      componentTree,
      (componentState, mappedChildren) => [
        componentState,
        ...mappedChildren.flat(),
      ],
      ancestorState
    ).flat();

    return descendants;
  }
}
