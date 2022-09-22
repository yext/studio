import { JsxText, JsxExpression, JsxSelfClosingElement, JsxElement, JsxFragment, SyntaxKind } from 'ts-morph'
import { ComponentState, JsxElementState } from '../../shared/models'
import parseComponentState from './parseComponentState'

export default function parseJsxChild(
  c: JsxText | JsxExpression | JsxSelfClosingElement | JsxElement | JsxFragment,
  imports: Record<string, string[]>,
  parentUUID?: string
): JsxElementState[] {
  // All whitespace in Jsx is also considered JsxText, for example indentation
  if (c.isKind(SyntaxKind.JsxText)) {
    if (c.getLiteralText().trim() !== '') {
      throw new Error(`Found JsxText with content "${c.getLiteralText()}". JsxText is not currently supported`)
    }
    return []
  } else if (c.isKind(SyntaxKind.JsxExpression)) {
    throw new Error(
      `Jsx nodes of kind "${c.getKindName()}" are not supported for direct use in page files.`)
  }

  const selfState: JsxElementState = {
    ...parseComponentState(c, imports),
    parentUUID
  }

  if (c.isKind(SyntaxKind.JsxSelfClosingElement)) {
    return [ selfState ]
  }

  const children: JsxElementState[] = c.getJsxChildren()
    .flatMap(c => parseJsxChild(c, imports, selfState.uuid))
    .filter((c): c is JsxElementState => !!c)
  return [ selfState, ...children ]
}