import { Project, ts } from 'ts-morph'
import { parsePropertyStructures, resolveNpmModule, tsCompilerOptions } from './common'
import { NpmComponentProps } from '../../shared/models'
import parsePropInterface from './parsePropInterface'

/**
 * Parses out the prop structure for a particular npm module.
 * Currently only supports functional react components.
 */
export default function parseNpmComponents(
  moduleName: string,
  matchers: (string | RegExp)[]
): NpmComponentProps[typeof moduleName] {
  const absPath = resolveNpmModule(moduleName)
  const p = new Project(tsCompilerOptions)
  p.addSourceFilesAtPaths(absPath)
  const sourceFile = p.getSourceFileOrThrow(absPath)

  const componentsToProps = {}
  sourceFile.getDescendantStatements().forEach(n => {
    if (!n.isKind(ts.SyntaxKind.FunctionDeclaration)) {
      return
    }
    const componentName = n.getName()
    if (!componentName || !testComponentName(componentName, matchers)) {
      return
    }
    const parameters = n.getParameters()
    if (parameters.length !== 1) {
      if (parameters.length > 1) {
        console.error(`Found ${parameters.length} number of arguments for functional component ${componentName}, expected only 1. Ignoring this component's props.`)
      }
      componentsToProps[componentName] = {}
      return
    }
    const typeNode = parameters[0].getTypeNode()
    if (!typeNode) {
      console.error(`No type information found for "${componentName}"'s props. Ignoring this component's props.`)
      componentsToProps[componentName] = {}
      return
    }
    if (typeNode.isKind(ts.SyntaxKind.TypeLiteral)) {
      const properties = typeNode.getProperties().map(p => p.getStructure())
      const propShape = parsePropertyStructures(properties, absPath)
      componentsToProps[componentName] = propShape
    } else if (typeNode.isKind(ts.SyntaxKind.TypeReference)) {
      try {
        // TODO(oshi): currently assumes that the prop interface is in the same file as the component itself
        // This is not necessarily the case. Deferring the import tracing logic for now, since an imported
        // interface may live several imports deep.
        const typeName = typeNode.getTypeName().getText()
        const propShape = parsePropInterface(absPath, typeName)
        componentsToProps[componentName] = propShape
      } catch (err) {
        console.error('Caught an error, likely with regards to nested interfaces. Ignoring props for ', componentName)
        console.error(err)
        componentsToProps[componentName] = {}
      }
    } else {
      console.error(`Unhandled parameter type "${typeNode.getKindName()}" found for "${componentName}". Ignoring this component's props.`)
      componentsToProps[componentName] = {}
    }
  })
  return componentsToProps
}

/**
 * React components must start with an uppercase letter. We can use this as a first
 * pass to reduce some of the parsing we have to do.
 *
 * It would be more robust to also check that the return type is JSX.Element or something of that nature.
 */
function firstCharacterIsUpperCase(componentName: string) {
  return componentName[0] === componentName[0].toUpperCase()
}

function testComponentName(componentName: string, matchers: (string | RegExp)[]): boolean {
  if (!firstCharacterIsUpperCase(componentName)) {
    return false
  }

  for (const m of matchers) {
    if (typeof m === 'string') {
      if (m === componentName) {
        return true
      }
    } else {
      if (m.test(componentName)) {
        return true
      }
    }
  }
  return false
}