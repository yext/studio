import { KindToNodeMappings, Node, SyntaxKind } from "ts-morph";

export default class TsMorphHelpers {
  private static getChildOfKind<T extends ReadonlyArray<SyntaxKind>>(
    getChild: (condition: (node: Node) => boolean) => Node | undefined,
    ...kinds: T
  ): KindToNodeMappings[OneOf<T>] | undefined {
    return getChild((n) => kinds.some((k) => n.isKind(k))) as
      | KindToNodeMappings[OneOf<T>]
      | undefined;
  }

  private static getChildOfKindOrThrow<T extends ReadonlyArray<SyntaxKind>>(
    node: Node,
    getChild: (condition: (node: Node) => boolean) => Node | undefined,
    ...kinds: T
  ): KindToNodeMappings[OneOf<T>] {
    const foundNode = TsMorphHelpers.getChildOfKind(getChild, ...kinds);
    if (!foundNode) {
      throw new Error(
        `Could not find a child of kind ${kinds
          .map((k) => {
            const expectedKindName = Object.entries(SyntaxKind).find(
              ([_, value]) => value === k
            )?.[0];
            return expectedKindName;
          })
          .join(", ")} in node \`${node.getFullText()}\`.`
      );
    }
    return foundNode;
  }

  /**
   * Similar to ts-morph's getFirstChildByKindOrThrow but accepts multiple kinds.
   */
  static getFirstChildOfKindOrThrow<T extends ReadonlyArray<SyntaxKind>>(
    node: Node,
    ...kinds: T
  ): KindToNodeMappings[OneOf<T>] {
    return this.getChildOfKindOrThrow(
      node,
      (condition) => node.getFirstChild(condition),
      ...kinds
    );
  }

  /**
   * Similar to ts-morph's getFirstChildByKind but accepts multiple kinds.
   */
  static getFirstChildOfKind<T extends ReadonlyArray<SyntaxKind>>(
    node: Node,
    ...kinds: T
  ): KindToNodeMappings[OneOf<T>] | undefined {
    return this.getChildOfKind(
      (condition) => node.getFirstChild(condition),
      ...kinds
    );
  }

  /**
   * Similar to ts-morph's getLastChildByKindOrThrow but accepts multiple kinds.
   */
  static getLastChildOfKindOrThrow<T extends ReadonlyArray<SyntaxKind>>(
    node: Node,
    ...kinds: T
  ): KindToNodeMappings[OneOf<T>] {
    return this.getChildOfKindOrThrow(
      node,
      (condition) => node.getLastChild(condition),
      ...kinds
    );
  }

  /**
   * Similar to ts-morph's isKind but accepts multiple kinds.
   */
  static isKind<T extends ReadonlyArray<SyntaxKind>>(
    node: Node,
    ...kinds: T
  ): node is KindToNodeMappings[OneOf<T>] {
    return kinds.some((k) => node.isKind(k));
  }
}

export type OneOf<T extends ReadonlyArray<unknown>> = T extends ReadonlyArray<
  infer OneOf
>
  ? OneOf
  : never;
