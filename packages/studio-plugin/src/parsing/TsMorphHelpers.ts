import { KindToNodeMappings, Node, SyntaxKind } from "ts-morph";

export default class TsMorphHelpers {
  /**
   * Similar to ts-morph's getFirstChildByKind but accepts multiple kinds.
   */
  private static getFirstChildOfKind<T extends ReadonlyArray<SyntaxKind>>(
    node: Node,
    ...kinds: T
  ): KindToNodeMappings[OneOf<T>] | undefined {
    return node.getFirstChild((n) => kinds.some((k) => n.isKind(k))) as
      | KindToNodeMappings[OneOf<T>]
      | undefined;
  }

  static getFirstChildOfKindOrThrow<T extends ReadonlyArray<SyntaxKind>>(
    node: Node,
    ...kinds: T
  ): KindToNodeMappings[OneOf<T>] {
    const foundNode = TsMorphHelpers.getFirstChildOfKind(node, ...kinds);
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
}

type OneOf<T extends ReadonlyArray<unknown>> = T extends ReadonlyArray<
  infer OneOf
>
  ? OneOf
  : never;
