import { SyntaxKind } from 'ts-morph'
import getSource from '../../tests/utils/getSource'
import parseJsxChild from './parseJsxChild'

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
  expect(parseJsxChild(topLevelNode, imports)).toHaveLength(2)
})

it('errors if detects non whitespace JsxText', () => {
  const source = getSource(`
    <Card bgColor='#abcdef'>
      JsxText IS NOT SUPPORTED YET
    </Card>
  `)
  const topLevelNode = source.getFirstDescendantByKindOrThrow(SyntaxKind.JsxElement)
  const imports = {
    './components': ['Card']
  }
  expect(() => parseJsxChild(topLevelNode, imports)).toThrow(/JsxText IS NOT SUPPORTED YET/)
})
