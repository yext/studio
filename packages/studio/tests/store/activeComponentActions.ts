import { ComponentStateKind, FileMetadataKind } from '@yext/studio-plugin';
import mockStore from '../__utils__/mockStore';

describe('updateActiveComponentProps', () => {
  it('when a module is being edited, updates the props inside the module\'s tree', () => {

  const initialComponentState = {
    kind: ComponentStateKind.Standard,
    componentName: "AComponent",
    uuid: "unused",
    props: {},
    metadataUUID: "unused",
  }
  mockStore({
    fileMetadatas: {
      UUIDToFileMetadata: {
        StarModuleMetadataUUID: {
          kind: FileMetadataKind.Module,
          componentTree: [initialComponentState],
          metadataUUID: "StarModuleMetadataUUID",
          filepath: "unused",
        },
      },
    },
    pages: {
      moduleUUIDBeingEdited: "ModuleState.uuid",
      activePageName: "pagename",
      pages: {
        pagename: {
          componentTree: [
            {
              kind: ComponentStateKind.Module,
              uuid: "ModuleState.uuid",
              metadataUUID: "StarModuleMetadataUUID",
              componentName: "StarModule",
              props: {},
            },
          ],
          cssImports: [],
          filepath: "unused",
        },
      },
    },
  });

  })

  it('when a module is not being edited, updates the props in the current active page', () => {

  })
})

describe('getActiveComponentState', () => {
  it('can get the current active state when a module is being edited', () => {

  })

  it('can get the current active state when a page is being edited', () => {
    
  })
})

describe('updateComponentTree', () => {
  it('can rearrange the component tree when a module is being edited', () => {

  })
  it('can rearrange the component tree when a page is being edited', () => {
    
  })
})

describe('getComponentTree', () => {
  it('can get the component tree when a module is being edited', () => {

  })
  it('can get the component tree when a page is being edited', () => {
    
  })
})