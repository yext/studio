import { SyntaxKind } from 'ts-morph'
import getSource from '../../tests/utils/getSource'
import { PropTypes } from '../../types'
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
    }
  })
})
