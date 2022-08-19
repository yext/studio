import { ObjectLiteralExpression, SourceFile, ts, VariableDeclarationKind } from 'ts-morph'
import getUpdatedStreamConfig from '../streams/getUpdatedStreamConfig'
import { ComponentState } from '../../shared/models'
import { TemplateConfig } from '@yext/pages/*'
import { runInNewContext } from 'vm'

/**
 * This function mutates the original sourceFile in addition to returning the new config.
 */
export default function updateStreamConfig(
  sourceFile: SourceFile,
  componentsState: ComponentState[]
): TemplateConfig {
  const streamObjectLiteral = getStreamObjectLiteral(sourceFile)
  const currentConfig = streamObjectLiteral && parseStreamObject(streamObjectLiteral)
  const updatedStreamConfig = getUpdatedStreamConfig(componentsState, currentConfig)
  const stringifiedConfig = JSON.stringify(updatedStreamConfig)
  if (streamObjectLiteral) {
    streamObjectLiteral.replaceWithText(stringifiedConfig)
  } else {
    const lastImportStatementIndex = Math.max(
      -1, ...sourceFile.getImportDeclarations().map(d => d.getChildIndex()))
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
    throw new Error(`Unrecognzied stream config export kind: "${variableDeclaration.getKindName()}`)
  }
  return variableDeclaration.getFirstDescendantByKindOrThrow(ts.SyntaxKind.ObjectLiteralExpression)
}

/**
 * This function takes in an {@link ObjectLiteralExpression} and returns it's data.
 *
 * It converts a js object string and converts it into an object using vm.runInNewContext,
 * which can be thought of as a safe version of `eval`. Note that we cannot use JSON.parse here,
 * because we are working with a js object not a JSON object.
 */
function parseStreamObject(objectLiteralExpression: ObjectLiteralExpression): TemplateConfig {
  return runInNewContext('(' + objectLiteralExpression.getText() + ')')
}
