import { ParameterDeclaration, SourceFile, ts, TypeNode } from 'ts-morph'
import { getSourceFile, parsePropertyStructures, resolveNpmModule } from '../common'
import { ComponentMetadata, CssImport, ModuleMetadata } from '../../shared/models'
import parseComponentMetadata, { pathToPagePreviewDir } from './parseComponentMetadata'
import path from 'path'
import { ComponentExportConfig, StudioNpmModulePlugin } from '../../shared/StudioNpmModulePlugin'

/**
 * Parses out the prop structures of all listed exported components for a particular npm module.
 * Also process any css imports defined in the module plugin for the components to display properly.
 *
 * Currently only supports functional react components and prop types defined in "PropTypes" enum.
 */
export default function parseNpmModule(
  plugin: StudioNpmModulePlugin
): ModuleMetadata {
  const moduleName = plugin.moduleName
  const absPath = resolveNpmModule(moduleName)
  const pathToNodeModulesDir = absPath.split(moduleName)[0]
  const importIdentifier = path.relative(pathToPagePreviewDir, pathToNodeModulesDir + moduleName)
  const sourceFile = getSourceFile(absPath)

  const componentConfigs: ComponentExportConfig[] = plugin.exports
    .map(c => typeof c === 'string' ? { exportIdentifier: c } : c)

  const moduleMetadata: ModuleMetadata = {
    cssImports: getModuleCssImports(plugin.cssImports, pathToNodeModulesDir),
    components: getModuleComponentMetadata(sourceFile, absPath, importIdentifier, componentConfigs)
  }
  return moduleMetadata
}

function getModuleCssImports(
  pluginCssImports: string[] | undefined,
  pathToNodeModulesDir: string
): CssImport[] | undefined {
  return pluginCssImports?.map(i => {
    return {
      moduleExportPath: i,
      relativePath: path.relative(
        pathToPagePreviewDir,
        path.resolve(pathToNodeModulesDir, require.resolve(i))
      )
    }
  })
}

function getModuleComponentMetadata(
  sourceFile: SourceFile,
  absPath: string,
  importIdentifier: string,
  componentConfigs: ComponentExportConfig[]
): Record<string, ComponentMetadata> {
  const errorMetadataValue: Readonly<ComponentMetadata> = {
    editable: false,
    importIdentifier,
    acceptsChildren: false
  }
  const matchers = componentConfigs.map(c => c.exportIdentifier)
  const componentsToProps: Record<string, ComponentMetadata> = {}

  sourceFile.getDescendantStatements().forEach(n => {
    if (!n.isKind(ts.SyntaxKind.FunctionDeclaration)) {
      return
    }
    const componentName = n.getName()
    if (!componentName || !isExportedReactComponent(componentName, n.getReturnTypeNode(), matchers)) {
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
    componentsToProps[componentName] = getComponentMetaData(
      typeNode, componentName, sourceFile, absPath, importIdentifier, componentConfigs, errorMetadataValue)
  })
  return componentsToProps
}

function isExportedReactComponent(
  componentName: string,
  returnTypeNode: TypeNode | undefined,
  matchers: string[]): boolean {
  if (!matchers.some(m => m === componentName)) {
    return false
  }
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
  if (parameters.length !== 1) {
    if (parameters.length > 1) {
      console.error(`Found ${parameters.length} number of arguments for functional component ${componentName}, expected only 1. Ignoring this component's props.`)
    }
    return false
  }
  return true
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

function getComponentMetaData(
  typeNode: TypeNode<ts.LiteralTypeNode> | TypeNode<ts.TypeReferenceNode>,
  componentName: string,
  sourceFile: SourceFile,
  absPath: string,
  importIdentifier: string,
  componentConfigs: ComponentExportConfig[],
  errorMetadataValue: ComponentMetadata
): ComponentMetadata {
  const pluginInitialProps = componentConfigs.find(c => c.exportIdentifier === componentName)?.initialProps
  if (typeNode.isKind(ts.SyntaxKind.TypeLiteral)) {
    const properties = typeNode.getProperties().map(p => p.getStructure())
    const { propShape, acceptsChildren } = parsePropertyStructures(properties, absPath)
    return {
      global: false,
      propShape,
      initialProps: pluginInitialProps ?? {},
      importIdentifier,
      acceptsChildren,
      editable: true
    }
  } else if (typeNode.isKind(ts.SyntaxKind.TypeReference)) {
    try {
      const typeName = typeNode.getTypeName().getText()
      const componentMetadata = parseComponentMetadata(sourceFile, absPath, typeName, importIdentifier)
      if (!componentMetadata.global) {
        componentMetadata.initialProps = pluginInitialProps ?? componentMetadata.initialProps
      }
      return componentMetadata
    } catch (err) {
      console.error(`Error parsing props for "${componentName}". Ignoring this component's props`, err)
      return errorMetadataValue
    }
  }
  return errorMetadataValue
}
