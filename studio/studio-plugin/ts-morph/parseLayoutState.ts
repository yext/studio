import { ComponentState } from '../../shared/models'
import { SourceFile, JsxElement, JsxFragment, ts } from 'ts-morph'
import { v1 } from 'uuid'
import { getDefaultExport } from '../common'
import getComponentModuleName from './getComponentModuleName'

export default function parseLayoutState(
  sourceFile: SourceFile,
  imports: Record<string, string[]>
): { layoutState: ComponentState, layoutNode: JsxElement | JsxFragment } {
  const defaultExport = getDefaultExport(sourceFile)
  const returnStatement = defaultExport.getFirstDescendantByKind(ts.SyntaxKind.ReturnStatement)
  if (!returnStatement) {
    throw new Error('No return statement found for page')
  }
  const JsxNodeWrapper = returnStatement.getFirstChildByKind(ts.SyntaxKind.ParenthesizedExpression)
    ?? returnStatement
  const topLevelJsxNode = JsxNodeWrapper.getChildren()
    .find(n => n.getKind() === ts.SyntaxKind.JsxElement || n.getKind() === ts.SyntaxKind.JsxFragment)
  if (!topLevelJsxNode) {
    throw new Error('Unable to find top level JSX element or JsxFragment type from file.')
  }

  let layoutState: ComponentState
  if (topLevelJsxNode.isKind(ts.SyntaxKind.JsxElement)) {
    const name = topLevelJsxNode.getOpeningElement().getTagNameNode().getText()
    layoutState = {
      name,
      props: {},
      uuid: v1(),
      moduleName: 'builtIn'
    }
    const isBuiltinJsxElement = name.charAt(0) === name.charAt(0).toLowerCase()
    if (!isBuiltinJsxElement && !['Fragment', 'React.Fragment'].includes(name)) {
      layoutState.moduleName = getComponentModuleName(name, imports, true)
    }
  } else {
    // This handles the React.Fragment shorthand <></>
    layoutState = {
      name: '',
      props: {},
      uuid: v1(),
      moduleName: 'builtIn'
    }
  }

  return {
    layoutState,
    layoutNode: topLevelJsxNode as JsxElement | JsxFragment
  }
}