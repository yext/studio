import { JsxOpeningElement, JsxSelfClosingElement, ts, Node } from 'ts-morph'

export function getComponentName(n: JsxOpeningElement | JsxSelfClosingElement): string {
  return n.getTagNameNode().getText()
}

export function getPropName(n: Node): string | undefined {
  return n.getFirstDescendantByKind(ts.SyntaxKind.Identifier)?.compilerNode.text
}
