import { ComponentMetadata, ModuleMetadata } from '../../shared/models'
import { StudioNpmModulePlugin } from '../../shared/StudioNpmModulePlugin'
import { PropTypes } from '../../types'
import parseNpmModule from './parseNpmModule'
import path from 'path'
import * as resolveNpmModule from '../common/resolveNpmModule'

jest.mock('../getRootPath')

jest.spyOn(resolveNpmModule, 'resolveNpmModule').mockImplementation((moduleName: string) => {
  return path.resolve(__dirname, '../__fixtures__/mock_modules', moduleName, 'index.d.ts')
})

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
  const plugin: StudioNpmModulePlugin = {
    moduleName: 'test-module',
    exports: ['TestComponent'],
    cssImports: ['test-module/index.css']
  }
  const expectedModuleMetadata: ModuleMetadata = {
    cssImports: [{
      moduleExportPath: 'test-module/index.css',
      relativePath: '../../studio-plugin/__fixtures__/mock_modules/test-module/index.css'
    }],
    components: {
      TestComponent: TestComponentMetadata
    }
  }
  expect(parseNpmModule(plugin)).toEqual(expectedModuleMetadata)
})

it('can parse npm module components by providing ComponentExportConfig', () => {
  const plugin: StudioNpmModulePlugin = {
    moduleName: 'test-module',
    exports: [{
      exportIdentifier: 'TestComponent',
      initialProps: {
        randomText: {
          type: PropTypes.string,
          value: 'test'
        }
      }
    }],
    cssImports: ['test-module/index.css']
  }
  const expectedModuleMetadata: ModuleMetadata = {
    cssImports: [{
      moduleExportPath: 'test-module/index.css',
      relativePath: '../../studio-plugin/__fixtures__/mock_modules/test-module/index.css'
    }],
    components: {
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
  }
  expect(parseNpmModule(plugin)).toEqual(expectedModuleMetadata)
})
