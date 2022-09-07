import { ComponentState, PageState } from '../../shared/models'
import { getSourceFile } from '../common'
import parseImports from './parseImports'
import parseLayoutState from './parseLayoutState'
import parseComponentState from './parseComponentState'

export default function parsePageFile(filePath: string): PageState {
  const sourceFile = getSourceFile(filePath)
  const imports = parseImports(sourceFile)

  const { layoutState, layoutNode } = parseLayoutState(sourceFile, imports)

  const componentsState: ComponentState[] = []
  layoutNode.getJsxChildren().forEach(n => {
    const componentState = parseComponentState(n, imports)
    if (componentState) {
      componentsState.push(componentState)
    }
  })

  return {
    layoutState,
    componentsState
  }
}
