import { RegularComponentState } from '../../shared/models'
import { SourceFile, JsxElement, JsxFragment, ts } from 'ts-morph'
import { v4 } from 'uuid'
import { getDefaultExport } from '../common'
import getComponentModuleName from './getComponentModuleName'
import getTopLevelJsxNode from './getTopLevelJsxNode'

export default function parseLayoutState(
  sourceFile: SourceFile,
  imports: Record<string, string[]>
): { layoutState: RegularComponentState, layoutNode: JsxElement | JsxFragment } {
  const defaultExport = getDefaultExport(sourceFile)
  const topLevelJsxNode = getTopLevelJsxNode(defaultExport)
  let layoutState: RegularComponentState
  if (topLevelJsxNode.isKind(ts.SyntaxKind.JsxElement)) {
    const name = topLevelJsxNode.getOpeningElement().getTagNameNode().getText()
    layoutState = {
      name,
      props: {},
      uuid: v4(),
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
      uuid: v4(),
      moduleName: 'builtIn'
    }
  }

  return {
    layoutState,
    layoutNode: topLevelJsxNode as JsxElement | JsxFragment
  }
}
