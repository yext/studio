import { ts } from 'ts-morph'
import { PageState, ComponentState, PossibleModuleNames } from '../../shared/models'
import getRootPath from '../getRootPath'
import { getComponentName, getComponentNodes, getPropName, getPropValue, getSourceFile } from './common'
import { v1 } from 'uuid'
import parseImports from './parseImports'

export default function parsePageFile(filePath): PageState {
  const file = getRootPath(filePath)
  const sourceFile = getSourceFile(file)
  const usedComponents = getComponentNodes(sourceFile)
  const imports = parseImports(sourceFile)

  const layoutNode = sourceFile.getFirstDescendantByKind(ts.SyntaxKind.JsxElement)?.getOpeningElement()

  const componentsState: ComponentState[] = []
  //Default Layout State
  let layoutState: ComponentState = {
    name: 'Layout',
    props: {},
    uuid: v1(),
    moduleName: 'localComponents'
  }

  usedComponents.forEach(n => {
    const name = getComponentName(n)
    let moduleName = Object.keys(imports).find(importIdentifier => {
      const importedNames = imports[importIdentifier]
      return importedNames.includes(name)
    })
    if (!moduleName) {
      throw new Error(`Could not find import path/module for component "${name}"`)
    }
    if (moduleName.startsWith('.')) {
      moduleName = 'localComponents'
    }
    const componentData = {
      name,
      props: {},
      uuid: v1(),
      moduleName: moduleName as PossibleModuleNames
    }
    if (n === layoutNode) {
      layoutState = componentData
      return
    }
    n.getDescendantsOfKind(ts.SyntaxKind.JsxAttribute).forEach(a => {
      const propName = getPropName(a)
      if (!propName) {
        throw new Error('Could not parse page file')
      }
      const propValue = getPropValue(a)
      componentData.props[propName] = propValue
    })
    componentsState.push(componentData)
  })

  return {
    layoutState,
    componentsState
  }
}
