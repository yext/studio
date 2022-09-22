import { ExpressionSourceType, PropTypes } from '../../types'
import { getSourceFile } from '../common'
import getRootPath from '../getRootPath'
import { updateFileImports } from './updateFileImports'

jest.mock('../getRootPath')

beforeEach(() => {
  jest.clearAllMocks()
})

const expressionSourcePaths = {
  [ExpressionSourceType.SiteSettings]: 'siteSettings'
}

it('can update page to use site settings based on expression source', () => {
  const sourceFile = getSourceFile(getRootPath('testPage.tsx'))
  updateFileImports(
    sourceFile,
    [{
      name: 'Banner',
      props: {
        title: {
          type: PropTypes.string,
          value: 'siteSettings.apiKey',
          isExpression: true
        },
      },
      uuid: '1',
      moduleName: 'localComponents'
    },
    {
      name: 'Banner',
      props: {
        title: {
          type: PropTypes.string,
          value: 'two'
        },
        randomNum: {
          type: PropTypes.number,
          value: 2,
        },
        someBool: {
          type: PropTypes.boolean,
          value: true
        },
      },
      uuid: '2',
      moduleName: 'localComponents'
    }],
    expressionSourcePaths
  )

  const expectedImportStatement = '\nimport siteSettings from "./siteSettings";'
  expect(sourceFile.getImportDeclarations().filter(d => d.getFullText() === expectedImportStatement))
    .toHaveLength(1)
})
