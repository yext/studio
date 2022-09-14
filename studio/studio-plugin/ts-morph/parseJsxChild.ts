import { JsxText, JsxExpression, JsxSelfClosingElement, JsxElement, JsxFragment, SyntaxKind } from 'ts-morph'
import { ComponentState } from '../../shared/models'
import parseComponentState from './parseComponentState'

export default function parseJsxChild(
  c: JsxText | JsxExpression | JsxSelfClosingElement | JsxElement | JsxFragment,
  imports: Record<string, string[]>,
  parentUUID?: string,
  depth = 0
): ComponentState[] {
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

  const selfState: ComponentState = {
    ...parseComponentState(c, imports),
    depth,
    parentUUID
  }

  if (c.isKind(SyntaxKind.JsxSelfClosingElement)) {
    return [ selfState ]
  }

  const children: ComponentState[] = c.getJsxChildren()
    .flatMap(c => parseJsxChild(c, imports, selfState.uuid, depth + 1))
    .filter((c): c is ComponentState => !!c)
  // selfState.childrenUUID = children.map(c => c.uuid)
  return [ selfState, ...children ]
}