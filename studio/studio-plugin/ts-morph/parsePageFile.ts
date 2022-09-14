import { ComponentState, PageState } from '../../shared/models'
import { getSourceFile } from '../common'
import parseImports from './parseImports'
import parseLayoutState from './parseLayoutState'
import parseComponentState from './parseComponentState'
import { JsxChild, JsxElement, JsxExpression, JsxFragment, JsxSelfClosingElement, JsxText, SyntaxKind } from 'ts-morph'
import parseJsxChild from './parseJsxChild'

export default function parsePageFile(filePath: string): PageState {
  const sourceFile = getSourceFile(filePath)
  const imports = parseImports(sourceFile)

  const { layoutState, layoutNode } = parseLayoutState(sourceFile, imports)

  const componentsState: ComponentState[] = []
  layoutNode.getJsxChildren().forEach((c: JsxChild) => {
    const componentState = parseJsxChild(c, imports)
  
    if (componentState) {
      componentsState.push(...componentState)
    }
  })

  const uuidToComponentState = componentsState.reduce((prev, curr) => {
    prev[curr.uuid] = curr
    return prev
  }, {})

  return {
    layoutState,
    componentsState,
    uuidToComponentState
  }
}
