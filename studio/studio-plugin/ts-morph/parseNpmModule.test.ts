import { ModuleMetadata } from '../../shared/models'
import { StudioNpmModulePlugin } from '../../shared/StudioNpmModulePlugin'
import { PropTypes } from '../../types'
import parseNpmModule from './parseNpmModule'

jest.mock('../getRootPath')

const expectedModuleMetadata: ModuleMetadata = {
  cssImports: ['../../studio-plugin/__fixtures__/node_modules/test-module/index.css'],
  components: {
    TestComponent: {
      propShape: {
        randomText: {
          type: PropTypes.string,
          doc: "some random text"
        },
        randomNum: {
          type: PropTypes.number,
          doc: "a random number!"
        }
      },
      global: false,
      initialProps: {},
      editable: true,
      "importIdentifier": "../../studio-plugin/__fixtures__/node_modules/test-module",
      acceptsChildren: false
    }
  }
}

it('can parse npm module components', () => {
  const plugin: StudioNpmModulePlugin = {
    moduleName: 'test-module',
    exports: ['TestComponent'],
    cssImports: ['test-module/index.css']
  }
  expect(parseNpmModule(plugin)).toEqual(expectedModuleMetadata)
})
