import { Project, ts } from 'ts-morph'
import { PropState } from '../../shared/models'
import { getPropName, getPropValue, tsCompilerOptions } from './common'

export default function parseInitialProps(filePath: string): PropState {
  const p = new Project(tsCompilerOptions)
  p.addSourceFilesAtPaths(filePath)
  const sourceFile = p.getSourceFileOrThrow(filePath)

  const initialProps = sourceFile.getDescendantsOfKind(ts.SyntaxKind.ObjectLiteralExpression).find(n => {
    return n.getParent().compilerNode.getFirstToken()?.getText() === 'initialProps'
  })

  const props: PropState = {}
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
