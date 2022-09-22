import { SourceFile } from 'ts-morph'
import { ComponentState, ElementStateType, JsxElementState } from '../../shared/models'
import { ExpressionSourceType } from '../../types'
import path from 'path'
import getRootPath from '../getRootPath'
import { getExpressionSources } from '../../shared/getExpressionSources'

export function updateFileImports(
  sourceFile: SourceFile,
  updatedComponentState: ComponentState[],
  expressionSourcePaths: { [key in ExpressionSourceType]?: string }
) {
  const expressionSourceTypeUsed: Set<string> = new Set()
  updatedComponentState.forEach(c => {
    Object.values(c.props).forEach(p => {
      if (p.isExpression) {
        getExpressionSources(p.value).forEach(s => expressionSourceTypeUsed.add(s.toString()))
      }
    })
  })
  sourceFile.getImportDeclarations().forEach(importDeclaration => {
    const defaultImport = importDeclaration.getDefaultImport()?.getText()
    if (defaultImport && expressionSourceTypeUsed.has(defaultImport)) {
      expressionSourceTypeUsed.delete(defaultImport)
    }
  })
  expressionSourceTypeUsed.forEach(expressionSource => {
    if (expressionSource === ExpressionSourceType.SiteSettings.toString()) {
      const expressionSourcePath = expressionSourcePaths[ExpressionSourceType.SiteSettings]
      if (!expressionSourcePath) {
        return
      }
      const filePath = sourceFile.getFilePath()
      let expressionImportSpecifier = path.relative(path.dirname(filePath), getRootPath(expressionSourcePath))
      if (expressionImportSpecifier.indexOf('/') === -1) {
        expressionImportSpecifier = './' + expressionImportSpecifier
      }
      sourceFile.addImportDeclaration({
        defaultImport: expressionSource,
        moduleSpecifier: expressionImportSpecifier
      })
    }
  })
}
