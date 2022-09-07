import { Project, SourceFile, SyntaxKind } from 'ts-morph'
import { PropTypes } from '../../types'
import { tsCompilerOptions } from '../common'
import parseComponentState from './parseComponentState'

jest.mock('../componentMetadata')
jest.mock('uuid', () => ({ v4: () => 'mock-uuid' }))

it('can parse nested components', () => {
  const source = getSource(`
  <Card bgColor='#abcdef'>
    <Card/>
  </Card>
`)
  const topLevelNode = source.getFirstDescendantByKindOrThrow(SyntaxKind.JsxElement)
  const imports = {
    './components': ['Card']
  }
  expect(parseComponentState(topLevelNode, imports)).toEqual({
    moduleName: 'localComponents',
    name: 'Card',
    uuid: 'mock-uuid',
    props: {
      bgColor: {
        type: PropTypes.HexColor,
        value: '#abcdef'
      }
    },
    children: [
      {
        moduleName: 'localComponents',
        name: 'Card',
        uuid: 'mock-uuid',
        props: {},
        parentUUIDsFromRoot: ['mock-uuid'],
      }
    ]
  })
})

function getSource(code: string): SourceFile {
  const p = new Project(tsCompilerOptions)
  p.createSourceFile('testPage.tsx', code)
  return p.getSourceFileOrThrow('testPage.tsx')
}