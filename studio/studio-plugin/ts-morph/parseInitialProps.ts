import { SourceFile, ts } from 'ts-morph'
import { PropShape, PropState } from '../../shared/models'
import { getPropsState } from '../common'

export function parseInitialProps(sourceFile: SourceFile, propShape: PropShape): PropState {
  const initialPropsSymbol = sourceFile.getExportSymbols().find(s => s.compilerSymbol.escapedName === 'initialProps')
  if (!initialPropsSymbol) {
    return {}
  }
  const initialPropsLiteralExp = initialPropsSymbol
    .getValueDeclaration()
    ?.getFirstDescendantByKind(ts.SyntaxKind.ObjectLiteralExpression)
  return initialPropsLiteralExp ? getPropsState(initialPropsLiteralExp, propShape) : {}
}
