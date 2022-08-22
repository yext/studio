import { SourceFile, ts } from 'ts-morph'
import { PropState } from '../../shared/models'
import parseObjectLiteralExpression from '../common/parseObjectLiteralExpression'

export default function parseInitialProps(sourceFile: SourceFile): PropState {
  const initialPropsSymbol = sourceFile.getExportSymbols().find(s => s.compilerSymbol.escapedName === 'initialProps')
  if (!initialPropsSymbol) {
    return {}
  }

  const initialProps =
    initialPropsSymbol?.getValueDeclaration()?.getFirstDescendantByKind(ts.SyntaxKind.ObjectLiteralExpression)
  if (!initialProps) {
    return {}
  }

  return parseObjectLiteralExpression(initialProps)
}
