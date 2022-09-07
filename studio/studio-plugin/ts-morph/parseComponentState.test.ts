import { Project, SourceFile, SyntaxKind } from 'ts-morph'
import { PropTypes } from '../../types'
import { tsCompilerOptions } from '../common'
import parseComponentState from './parseComponentState'

jest.mock('../componentMetadata')
jest.mock('uuid', () => ({ v1: () => 'mock-uuid' }))

it('works', () => {
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
        props: {}
      }
    ]
  })
})
// it('works', () => {
//   const source = getSource(`
//   <Card bgColor='#abcdef'>
//     <Card bgColor='#ffffff'/>
//   </Card>
// `)
//   const topLevelNode = source.getFirstDescendantByKindOrThrow(SyntaxKind.JsxElement)
//   const imports = {
//     './components': ['Card']
//   }
//   expect(parseComponentState(topLevelNode, imports)).toEqual({
//     moduleName: 'localComponents',
//     name: 'Card',
//     uuid: 'mock-uuid',
//     props: {
//       bgColor: {
//         type: PropTypes.HexColor,
//         value: '#abcdef'
//       }
//     },
//     children: [
//       {
//         moduleName: 'localComponents',
//         name: 'Card',
//         uuid: 'mock-uuid',
//         props: {
//           bgColor: {
//             type: PropTypes.HexColor,
//             value: '#ffffff'
//           }
//         }
//       }
//     ]
//   })
// })

function getSource(code: string): SourceFile {
  const p = new Project(tsCompilerOptions)
  p.createSourceFile('testPage.tsx', code)
  return p.getSourceFileOrThrow('testPage.tsx')
}