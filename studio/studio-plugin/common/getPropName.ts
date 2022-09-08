import { Node, SyntaxKind } from 'ts-morph'

export function getPropName(n: Node): string | undefined {
  return n.getFirstDescendantByKind(SyntaxKind.Identifier)?.compilerNode.text
}
