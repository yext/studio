import { ObjectLiteralExpression, SourceFile, ts, VariableDeclarationKind } from 'ts-morph'
import getUpdatedStreamConfig from '../streams/getUpdatedStreamConfig'
import { RegularComponentState } from '../../shared/models'
import { TemplateConfig } from '@yext/pages'
import { parseObjectLiteralExpression } from '../common'

/**
 * This function mutates the original sourceFile in addition to returning the new config.
 */
export default function updateStreamConfig(
  sourceFile: SourceFile,
  componentsState: RegularComponentState[]
): TemplateConfig {
  const streamObjectLiteral = getStreamObjectLiteral(sourceFile)
  const currentConfig = streamObjectLiteral &&
    parseObjectLiteralExpression<TemplateConfig>(streamObjectLiteral)
  const updatedStreamConfig = getUpdatedStreamConfig(componentsState, currentConfig)
  const stringifiedConfig = JSON.stringify(updatedStreamConfig)
  if (streamObjectLiteral) {
    streamObjectLiteral.replaceWithText(stringifiedConfig)
  } else {
    const lastImportStatementIndex =
      sourceFile.getLastChildByKind(ts.SyntaxKind.ImportDeclaration)?.getChildIndex() ?? -1
    sourceFile.insertVariableStatement(lastImportStatementIndex + 1, {
      isExported: true,
      declarationKind: VariableDeclarationKind.Const,
      declarations: [
        {
          name: 'config',
          initializer: stringifiedConfig,
        }
      ]
    })
  }
  return updatedStreamConfig
}

function getStreamObjectLiteral(sourceFile: SourceFile): ObjectLiteralExpression | undefined {
  const exportsMap = sourceFile.getExportedDeclarations()
  const variableDeclaration = exportsMap.get('config')?.[0]
  if (!variableDeclaration) {
    return undefined
  }
  if (!variableDeclaration.isKind(ts.SyntaxKind.VariableDeclaration)) {
    throw new Error(`Unrecognized stream config export kind: "${variableDeclaration.getKindName()}`)
  }
  return variableDeclaration.getFirstDescendantByKindOrThrow(ts.SyntaxKind.ObjectLiteralExpression)
}
