import { ComponentState, JsxElementState, PageState } from '../../shared/models'
import { getSourceFile } from '../common'
import parseImports from './parseImports'
import parseLayoutState from './parseLayoutState'
import { JsxChild } from 'ts-morph'
import parseJsxChild from './parseJsxChild'

export default function parsePageFile(filePath: string): PageState {
  const sourceFile = getSourceFile(filePath)
  const imports = parseImports(sourceFile)

  const { layoutState, layoutNode } = parseLayoutState(sourceFile, imports)

  const componentsState: JsxElementState[] = []
  layoutNode.getJsxChildren().forEach((c: JsxChild) => {
    const componentState = parseJsxChild(c, imports)

    if (componentState) {
      componentsState.push(...componentState)
    }
  })

  return {
    layoutState,
    componentsState
  }
}
