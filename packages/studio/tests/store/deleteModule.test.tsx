import { ComponentStateKind } from '@yext/studio-plugin'
import mockStore from '../__utils__/mockStore'

it('can delete a module and detach all of its instances across multiple pages', () => {
  const basicPageState = {
    componentTree: [
      {
        kind: ComponentStateKind.Module,
        componentName: 'Star',
        props: {},
        uuid: 'first-comp-state',
        metadataUUID: 'star-metadata-uuid'
      }
    ],
    cssImports: [],
    filepath: 'unused'
  }
  mockStore({
    fileMetadatas: {
      
    },
    pages: {
      activeComponentUUID: 'this should be unset after the action',
      activePageName: 'test-page',
      pages: {
        firstPage: basicPageState,
        secondPage: basicPageState
      }
    }
  });

})