import { Node, SyntaxKind, KindToNodeMappings } from "ts-morph";

export default function expectSyntaxKind<T extends SyntaxKind>(
  node: Node,
  expectedKind: T
): asserts node is KindToNodeMappings[T] {
  if (!node.isKind(expectedKind)) {
    const expectedKindName = Object.entries(SyntaxKind).find(
      ([_, value]) => value === expectedKind
    )?.[0];
    throw new Error(
      `Received kind ${node.getKindName()} instead of ${expectedKindName} for \`${node.getFullText()}\``
    );
  }
  expect(node.isKind(expectedKind)).toBeTruthy();
}
