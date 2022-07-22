import { SourceFile, ts } from 'ts-morph'
import { PropState } from '../../shared/models'
import { getPropName, getPropValue } from './common'

export default function parseInitialProps(sourceFile: SourceFile): PropState {
  const props: PropState = {}
  const initialPropsSymbol = sourceFile.getExportSymbols().find(s => s.compilerSymbol.escapedName === 'initialProps')
  if (!initialPropsSymbol) {
    return props
  }

  const initialProps =
    initialPropsSymbol?.getValueDeclaration()?.getFirstDescendantByKind(ts.SyntaxKind.ObjectLiteralExpression)
  if (!initialProps) {
    return props
  }

  initialProps.getDescendants().forEach(d => {
    const propName = getPropName(d)
    if (!propName) {
      return
    }
    props[propName] = getPropValue(d)
  })

  return props
}
