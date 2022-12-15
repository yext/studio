import { Node, SyntaxKind, KindToNodeMappings } from "ts-morph";

export default function expectSyntaxKind<T extends SyntaxKind>(
  node: Node | undefined,
  expectedKind: T
): asserts node is KindToNodeMappings[T] {
  const expectedKindName = Object.entries(SyntaxKind).find(
    ([_, value]) => value === expectedKind
  )?.[0];
  if (!node) {
    throw new Error(`Node is undefined, expected a ${expectedKindName}`);
  }
  if (!node.isKind(expectedKind)) {
    throw new Error(
      `Received kind ${node.getKindName()} instead of ${expectedKindName} for \`${node.getFullText()}\``
    );
  }
  expect(node.isKind(expectedKind)).toBeTruthy();
}
