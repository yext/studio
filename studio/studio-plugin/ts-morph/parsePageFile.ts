import { ts, JsxElement, JsxFragment } from 'ts-morph'
import { ComponentState, PageState } from '../../shared/models'
import { getComponentName, getComponentNodes, getSourceFile } from '../common'
import { v1 } from 'uuid'
import parseImports from './parseImports'
import { moduleNameToComponentMetadata } from '../componentMetadata'
import getComponentModuleName from './getComponentModuleName'
import parseLayoutState from './parseLayoutState'
import parseJsxAttributes from './parseJsxAttributes'

export default function parsePageFile(filePath: string): PageState {
  const sourceFile = getSourceFile(filePath)
  const imports = parseImports(sourceFile)

  const { layoutState, layoutNode } = parseLayoutState(sourceFile, imports)
  const usedComponents = getComponentNodes(layoutNode)

  const layoutJsxOpeningElement = layoutNode.getKind() === ts.SyntaxKind.JsxElement
    ? (layoutNode as JsxElement).getOpeningElement()
    : (layoutNode as JsxFragment).getOpeningFragment()

  const componentsState: ComponentState[] = []
  usedComponents.forEach(n => {
    if (n === layoutJsxOpeningElement) {
      return
    }
    const name = getComponentName(n)
    const moduleName = getComponentModuleName(name, imports, false)
    const componentData: ComponentState = {
      name,
      props: {},
      uuid: v1(),
      moduleName
    }
    const componentMetaData = moduleNameToComponentMetadata[moduleName][name]
    componentData.props = componentMetaData.global
      ? componentMetaData.globalProps ?? {}
      : parseJsxAttributes(n, componentMetaData)
    componentsState.push(componentData)
  })

  return {
    layoutState,
    componentsState
  }
}
