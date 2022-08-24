import { JsxOpeningElement, JsxSelfClosingElement, ts, JsxElement, JsxFragment } from 'ts-morph'

export function getComponentNodes(
  parentNode: JsxElement | JsxFragment
): (JsxOpeningElement | JsxSelfClosingElement)[] {
  const nodes = parentNode
    .getDescendants()
    .filter(n => {
      return n.isKind(ts.SyntaxKind.JsxOpeningElement) || n.isKind(ts.SyntaxKind.JsxSelfClosingElement)
    }) as (JsxOpeningElement | JsxSelfClosingElement)[]
  return nodes
}
