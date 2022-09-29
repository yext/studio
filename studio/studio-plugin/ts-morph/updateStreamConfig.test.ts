import { RegularComponentState } from '../../shared/models'
import getRootPath from '../getRootPath'
import { getSourceFile } from '../common'
import updateStreamConfig from './updateStreamConfig'
import { PropTypes } from '../../types'

jest.mock('../getRootPath')

const COMPONENTS_STATE: RegularComponentState[] = [
  {
    name: 'Banner',
    props: {
      streamTemplateString: {
        type: PropTypes.string,
        // eslint-disable-next-line no-template-curly-in-string
        value: '`${document.id}: ${document.address.line1}`',
      },
      notStreams: {
        type: PropTypes.number,
        value: 123
      }
    },
    moduleName: 'localComponents',
    uuid: 'mock-uuid'
  },
  {
    name: 'Banner',
    props: {
      streamPath: {
        type: PropTypes.string,
        value: 'document.id',
        isExpression: true
      }
    },
    moduleName: 'localComponents',
    uuid: 'mock-uuid'
  }
]

it('parse out the stream config object', () => {
  const sourceFile = getSourceFile(getRootPath('streamsPage.tsx'))
  const updatedConfig = updateStreamConfig(sourceFile, COMPONENTS_STATE)
  expect(sourceFile.getText()).toContain('export const config: TemplateConfig = ' + JSON.stringify(updatedConfig))
})

it('can generate the stream config (i.e. TemplateConfig) when no preexisting one exists', () => {
  const sourceFile = getSourceFile(getRootPath('fragmentLayoutPage.tsx'))
  const updatedConfig = updateStreamConfig(sourceFile, COMPONENTS_STATE)
  expect(sourceFile.getText()).toContain('export const config = ' + JSON.stringify(updatedConfig))
})

it('works on a blank page with no imports and does not error out', () => {
  const sourceFile = getSourceFile(getRootPath('emptyPage.tsx'))
  const updatedConfig = updateStreamConfig(sourceFile, COMPONENTS_STATE)
  expect(sourceFile.getText()).toContain('export const config = ' + JSON.stringify(updatedConfig))
})