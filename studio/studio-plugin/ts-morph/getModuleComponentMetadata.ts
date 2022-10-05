import { ParameterDeclaration, ts, TypeNode } from 'ts-morph'
import { getSourceFile } from '../common'
import { ComponentMetadata } from '../../shared/models'
import parseComponentMetadata from './parseComponentMetadata'
import { ComponentExportConfig, StudioNpmModulePlugin } from '../../shared/StudioNpmModulePlugin'

export default function getModuleComponentMetadata(
  moduleAbsPath: string,
  importIdentifier: string,
  pluginExports: StudioNpmModulePlugin['exports']
): Record<string, ComponentMetadata> {
  const errorMetadataValue: Readonly<ComponentMetadata> = {
    editable: false,
    importIdentifier,
    acceptsChildren: false
  }
  const sourceFile = getSourceFile(moduleAbsPath)
  const componentConfigs: ComponentExportConfig[] = pluginExports
    .map(c => typeof c === 'string' ? { exportIdentifier: c } : c)
  const matchers = componentConfigs.map(c => c.exportIdentifier)
  const componentsToProps: Record<string, ComponentMetadata> = {}
  sourceFile.getDescendantStatements().forEach(n => {
    if (!n.isKind(ts.SyntaxKind.FunctionDeclaration)) {
      return
    }
    const componentName = n.getName()
    if (!componentName || !matchers.some(m => m === componentName)) {
      return
    }
    if (!isExportedReactComponent(componentName, n.getReturnTypeNode())) {
      return
    }
    const parameters = n.getParameters()
    if (!isComponentParamCountValid(parameters, componentName)) {
      componentsToProps[componentName] = errorMetadataValue
      return
    }
    const typeNode = parameters[0].getTypeNode()
    if (!isComponentParamTypeValid(typeNode, componentName)) {
      componentsToProps[componentName] = errorMetadataValue
      return
    }
    const pluginInitialProps = componentConfigs.find(c => c.exportIdentifier === componentName)?.initialProps
    const dataToParsePropsBy = typeNode.isKind(ts.SyntaxKind.TypeLiteral)
      ? typeNode.getProperties().map(p => p.getStructure())
      : typeNode.getText()
    try {
      componentsToProps[componentName] = parseComponentMetadata(
        sourceFile, moduleAbsPath, dataToParsePropsBy, { importIdentifier, initialProps: pluginInitialProps })
    } catch (err) {
      console.error(`Error parsing props for "${componentName}". Ignoring this component's props`, err)
      componentsToProps[componentName] = errorMetadataValue
    }
  })
  return componentsToProps
}

function isExportedReactComponent(
  componentName: string,
  returnTypeNode: TypeNode | undefined): boolean {
  if (componentName[0] !== componentName[0].toUpperCase()) {
    return false
  }
  const reactReturnType = ['JSX.Element', 'ReactElement', 'React.ReactElement']
  if (returnTypeNode
    && !returnTypeNode.forEachChildAsArray().some(n => reactReturnType.includes(n.getText()))) {
    return false
  }
  return true
}

function isComponentParamCountValid(parameters: ParameterDeclaration[], componentName: string): boolean {
  if (parameters.length > 1) {
    console.error(`Found ${parameters.length} number of arguments for functional component ${componentName}, expected only 1. Ignoring this component's props.`)
  }
  return parameters.length === 1
}

function isComponentParamTypeValid(
  typeNode: TypeNode | undefined,
  componentName: string
): typeNode is TypeNode<ts.LiteralTypeNode> | TypeNode<ts.TypeReferenceNode> {
  if (!typeNode) {
    console.error(`No type information found for "${componentName}"'s props. Ignoring this component's props.`)
    return false
  }
  const typeNodeKind = typeNode.getKind()
  if (typeNodeKind !== ts.SyntaxKind.TypeLiteral && typeNodeKind !== ts.SyntaxKind.TypeReference) {
    console.error(`Unhandled parameter type "${typeNode.getKindName()}" found for "${componentName}". Ignoring this component's props.`)
    return false
  }
  return true
}
