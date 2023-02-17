import {
  ComponentState,
  ComponentStateKind,
  FileMetadataKind,
} from "@yext/studio-plugin";
import useStudioStore from "../../../src/store/useStudioStore";
import { searchBarComponent } from "../../__fixtures__/componentStates";
import mockStore from "../../__utils__/mockStore";

const initialTree: ComponentState[] = [
  {
    kind: ComponentStateKind.Fragment,
    uuid: "mock-uuid-0",
  },
  {
    ...searchBarComponent,
    uuid: "mock-uuid-1",
    parentUUID: "mock-uuid-0",
  },
  {
    ...searchBarComponent,
    uuid: "mock-uuid-2",
    parentUUID: "mock-uuid-1",
  },
  {
    ...searchBarComponent,
    uuid: "mock-uuid-3",
    parentUUID: "mock-uuid-0",
  },
];

it("removes component and its children from ModuleMetadata when a module is being edited", () => {
  mockStore({
    fileMetadatas: {
      UUIDToFileMetadata: {
        StarModuleMetadataUUID: {
          kind: FileMetadataKind.Module,
          componentTree: initialTree,
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
  useStudioStore.getState().actions.removeComponent("mock-uuid-1");
  expect(
    useStudioStore.getState().fileMetadatas.UUIDToFileMetadata[
      "StarModuleMetadataUUID"
    ]
  ).toEqual(
    expect.objectContaining({
      componentTree: [initialTree[0], initialTree[3]],
    })
  );
});

it("removes component and its children from the active PageState when no module is being edited", () => {
  mockStore({
    pages: {
      activePageName: "pagename",
      pages: {
        pagename: {
          componentTree: initialTree,
          cssImports: [],
          filepath: "unused",
        },
      },
    },
  });

  useStudioStore.getState().actions.removeComponent("mock-uuid-1");
  const updatedTree =
    useStudioStore.getState().pages.pages["pagename"].componentTree;
  expect(updatedTree).toEqual([initialTree[0], initialTree[3]]);
});
