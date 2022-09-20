import { SourceFile } from 'ts-morph'
import { ComponentState } from '../../shared/models'
import { isExpressionState } from '../../shared/isExpressionState'
import { ExpressionSourceType } from '../../types'
import path from 'path'
import getRootPath from '../getRootPath'

export function updateFileImports(
  sourceFile: SourceFile,
  updatedComponentState: ComponentState[],
  expressionSourcePaths: { [key in ExpressionSourceType]?: string }
) {
  const expressionSourceTypeUsed: Set<string> = new Set()
  updatedComponentState.forEach(c =>
    Object.values(c.props).forEach(p => {
      if (isExpressionState(p)) {
        p.expressionSources.forEach(s => expressionSourceTypeUsed.add(s.toString()))
      }
    })
  )
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
      console.log(expressionSource, expressionImportSpecifier)
      sourceFile.addImportDeclaration({
        defaultImport: expressionSource,
        moduleSpecifier: expressionImportSpecifier
      })
    }
  })
}
