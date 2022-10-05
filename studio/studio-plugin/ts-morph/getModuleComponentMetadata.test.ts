import { ComponentMetadata, ModuleMetadata } from '../../shared/models'
import { PropTypes } from '../../types'
import getModuleComponentMetadata from './getModuleComponentMetadata'
import { resolve } from 'path'

jest.mock('../getRootPath')

const TestComponentMetadata: ComponentMetadata = {
  propShape: {
    randomText: {
      type: PropTypes.string,
      doc: 'some random text'
    },
    randomNum: {
      type: PropTypes.number,
      doc: 'a random number!'
    }
  },
  initialProps: {},
  global: false,
  editable: true,
  importIdentifier: '../../studio-plugin/__fixtures__/mock_modules/test-module',
  acceptsChildren: false
}

it('can parse npm module components by providing component name', () => {
  const expectedComponentMetadata: ModuleMetadata['components'] = {
    TestComponent: TestComponentMetadata
  }
  expect(getModuleComponentMetadata(
    resolve(__dirname, '../__fixtures__/mock_modules/test-module/index.d.ts'),
    '../../studio-plugin/__fixtures__/mock_modules/test-module',
    ['TestComponent']
  )).toEqual(expectedComponentMetadata)
})

it('can parse npm module components by providing ComponentExportConfig', () => {
  const expectedComponentMetadata: ModuleMetadata['components'] = {
    TestComponent: {
      ...TestComponentMetadata,
      initialProps: {
        randomText: {
          type: PropTypes.string,
          value: 'test'
        }
      }
    }
  }
  expect(getModuleComponentMetadata(
    resolve(__dirname, '../__fixtures__/mock_modules/test-module/index.d.ts'),
    '../../studio-plugin/__fixtures__/mock_modules/test-module',
    [{
      exportIdentifier: 'TestComponent',
      initialProps: {
        randomText: {
          type: PropTypes.string,
          value: 'test'
        }
      }
    }]
  )).toEqual(expectedComponentMetadata)
})
