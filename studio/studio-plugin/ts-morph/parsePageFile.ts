import { JsxAttribute, ts, SourceFile, JsxElement, JsxFragment } from 'ts-morph'
import { ComponentState, PossibleModuleNames, PageState } from '../../shared/models'
import { getComponentName, getComponentNodes, getDefaultExport, getJsxAttributeValue, getPropName, getSourceFile } from '../common/common'
import { v1 } from 'uuid'
import parseImports from './parseImports'
import { moduleNameToComponentMetadata } from '../componentMetadata'
import validatePropState from '../common/validatePropState'

function parseLayoutState(
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
  if (topLevelJsxNode.getKind() === ts.SyntaxKind.JsxElement) {
    const name = getComponentName((topLevelJsxNode as JsxElement).getOpeningElement())
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
// TODO(oshi): move parsePageFile to the top of this file
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
    n.getDescendantsOfKind(ts.SyntaxKind.JsxAttribute).forEach((jsxAttribute: JsxAttribute) => {
      const propName = getPropName(jsxAttribute)
      if (!propName) {
        throw new Error('Could not parse jsx attribute prop name: ' + jsxAttribute.getFullText())
      }
      const propType = moduleNameToComponentMetadata[moduleName][name].propShape?.[propName]?.type
      if (!propType) {
        throw new Error('Could not find prop type for: ' + jsxAttribute.getFullText())
      }
      const propValue = getJsxAttributeValue(jsxAttribute)
      const propState = {
        type: propType,
        value: propValue
      }
      if (!validatePropState(propState)) {
        throw new Error(`Could not validate propState ${JSON.stringify(propState, null, 2)}`)
      }
      componentData.props[propName] = propState
    })
    componentsState.push(componentData)
  })

  return {
    layoutState,
    componentsState
  }
}

function getComponentModuleName(
  name: string,
  imports: Record<string, string[]>,
  isLayout: boolean
): PossibleModuleNames {
  let moduleName = Object.keys(imports).find(importIdentifier => {
    const importedNames = imports[importIdentifier]
    return importedNames.includes(name)
  })
  if (!moduleName) {
    throw new Error(`Could not find import path/module for component "${name}"`)
  }
  if (moduleName.startsWith('.')) {
    moduleName = isLayout ? 'localLayouts' : 'localComponents'
  }
  return moduleName as PossibleModuleNames
}
